#!/usr/bin/env bash
set -Eeuo pipefail

######################################
# bkmk API deploy (COS-411)
#
# Adapted from ~/dev/pfa/nest-api/deploy-api.sh. Same shape: a timestamped release directory, an
# atomic switch with the previous version kept in .bak, automatic rollback if anything after the
# switch fails, and a served changelog of what shipped.
#
# Two things pfa's script does not have to do:
#
#   1. **A named dump before the migration.** bkmk's backup is a single `bkmkdump.sql`, overwritten
#      in place by the cron at 00:00 and 12:00 with no retention. A migration that damages data and
#      is noticed the next morning has already had its only copy overwritten with the damage. So
#      the deploy takes its own dump, under a name the cron will never touch.
#
#   2. **`pnpm migrate`.** pfa runs `prisma migrate deploy`; here it is the runner from COS-332,
#      which applies what `schema_migrations` says is pending and records each file as it goes.
#
# ⚠️ **Order: install, dump, migrate, then switch.** The migration runs from the staging directory,
# before production points at the new code, because that is the step most likely to fail and the
# cheapest moment to fail at — nothing has moved yet. The reverse risk, a migration that succeeds
# and a switch that then fails, is harmless here: every migration so far is additive (ADD COLUMN
# NULL, CREATE TABLE), so the old code keeps running against the new schema without noticing.
######################################

######################################
# Configuration
######################################
REMOTE_USER_HOST="debian@ks-b"

APP_ROOT="/var/www/bkmk"
BACKEND_DIR="$APP_ROOT/backend"
BACKEND_BACKUP_DIR="$APP_ROOT/backend.bak"
RELEASES_DIR="$APP_ROOT/backend-releases"
DB_BACKUPS_DIR="$APP_ROOT/db-backups"

# Local project dir (= backend/, where this script lives)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# The production environment. Gitignored, lives only here and on the server, and carries the
# database password and the session secret — which is why it is scp'd separately rather than
# rsync'd with the sources, and why the rsync below excludes every ecosystem.config*.
LOCAL_ENV_FILE="$SCRIPT_DIR/ecosystem.config.prod.js"

######################################
# Utility functions
######################################

log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $*"
}

remote_pm2_reload() {
  ssh "$REMOTE_USER_HOST" \
    BACKEND_DIR="$BACKEND_DIR" \
    'bash -s' << 'EOF'
set -Eeuo pipefail
export PATH="/home/debian/.npm-global/bin:/home/debian/.local/share/pnpm:/usr/local/bin:/usr/bin:/bin:/usr/sbin:$PATH"

cd "$BACKEND_DIR"

# --update-env because pm2 caches the environment across restarts: without it a changed
# SESSION_SECRET or a newly added variable in ecosystem.config.js is simply not read, and the
# server either keeps the old value or refuses to boot on a variable that is sitting right there
# in the file.
pm2 startOrReload ecosystem.config.js --env production --update-env
pm2 save
EOF
}

remote_rollback() {
  ssh "$REMOTE_USER_HOST" \
    BACKEND_DIR="$BACKEND_DIR" \
    BACKEND_BACKUP_DIR="$BACKEND_BACKUP_DIR" \
    'bash -s' << 'EOF'
set -Eeuo pipefail

if [ ! -d "$BACKEND_BACKUP_DIR" ]; then
  echo "❌ ERROR: No backup directory found at $BACKEND_BACKUP_DIR" >&2
  exit 1
fi

rm -rf "$BACKEND_DIR"
mv "$BACKEND_BACKUP_DIR" "$BACKEND_DIR"

echo "✅ API rollback done on server (restored from backup)"
EOF
}

deploy() {
  cd "$SCRIPT_DIR"

  if [ ! -f "$LOCAL_ENV_FILE" ]; then
    echo "❌ ERROR: missing $LOCAL_ENV_FILE" >&2
    echo "   It is gitignored on purpose. It is what becomes ecosystem.config.js on the server." >&2
    exit 1
  fi

  local GIT_HASH GIT_BRANCH_RAW GIT_BRANCH TIMESTAMP
  GIT_HASH=$(git rev-parse --short HEAD 2>/dev/null || echo "no-git")
  GIT_BRANCH_RAW=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "no-branch")
  GIT_BRANCH=${GIT_BRANCH_RAW//\//-}
  GIT_BRANCH=${GIT_BRANCH// /_}
  TIMESTAMP=$(date +'%Y%m%d-%H%M%S')

  local RELEASE_NAME="release-${TIMESTAMP}-${GIT_BRANCH}-${GIT_HASH}"
  local STAGING_DIR="$RELEASES_DIR/$RELEASE_NAME"
  local DUMP_FILE="$DB_BACKUPS_DIR/bkmkdump-pre-deploy-${TIMESTAMP}.sql"
  local SWITCH_DONE="false"

  on_error() {
    local lineno=$1
    log "❌ ERROR: API deployment failed at line $lineno"

    if [[ "$SWITCH_DONE" == "true" ]]; then
      log "↩️  Auto rollback: restoring previous API version"
      if remote_rollback; then
        remote_pm2_reload || true
        log "✅ Auto rollback succeeded"
      else
        log "❌ Auto rollback failed, manual intervention required"
      fi
    else
      log "ℹ️  No rollback needed: production was not modified yet"
    fi

    log "ℹ️  The pre-deploy dump, if it was taken, is at: $DUMP_FILE"
  }

  # Prepend this deploy's commits (+ Linear tickets) to the served changelog.
  # Always invoked as `write_deploy_log || log ...`: a changelog hiccup can never fail or roll back
  # an otherwise successful deploy.
  write_deploy_log() {
    local APP="api"
    local LOG_DIR="$APP_ROOT/deploy-logs"
    local LOG_FILE="$LOG_DIR/deploys-$APP.txt"
    local MARKER="$LOG_DIR/.last-$APP"
    local FULL_HASH WHEN PREV_HASH TICKETS COMMITS ENTRY_TMP
    local -a RANGE
    FULL_HASH=$(git rev-parse HEAD)
    WHEN=$(date +'%Y-%m-%d %H:%M:%S')

    PREV_HASH=$(ssh "$REMOTE_USER_HOST" "cat '$MARKER' 2>/dev/null || true")
    [ -z "$PREV_HASH" ] && PREV_HASH="${BKMK_SINCE:-}"
    if [ -n "$PREV_HASH" ] && ! git cat-file -e "${PREV_HASH}^{commit}" 2>/dev/null; then
      PREV_HASH=""
    fi
    if [ -n "$PREV_HASH" ]; then
      RANGE=("${PREV_HASH}..HEAD")
    else
      RANGE=(-n 10 HEAD)
    fi

    COMMITS=$(git log --no-merges --pretty=format:'  %h  %ad  %s' --date=short "${RANGE[@]}")
    TICKETS=$(printf '%s\n' "$COMMITS" \
      | grep -oiE 'COS-[0-9]+' | tr 'a-z' 'A-Z' | sort -t- -k2,2n -u | paste -sd ',' - | sed 's/,/, /g' || true)

    ENTRY_TMP=$(mktemp)
    {
      echo "=== $WHEN · branch $GIT_BRANCH_RAW · deploy $GIT_HASH ==="
      [ -n "$TICKETS" ] && echo "Tickets: $TICKETS"
      [ -z "$PREV_HASH" ] && echo "  (first recorded deploy — baseline: last 10 commits, not full history)"
      if [ -n "$COMMITS" ]; then
        printf '%s\n' "$COMMITS"
      else
        echo "  (no new commit — redeploy of $GIT_HASH)"
      fi
      echo
    } > "$ENTRY_TMP"

    # Commit messages travel as file content (scp), never interpolated into a shell command.
    ssh "$REMOTE_USER_HOST" "mkdir -p '$LOG_DIR'"
    scp -q "$ENTRY_TMP" "$REMOTE_USER_HOST:$LOG_DIR/.entry.tmp"
    ssh "$REMOTE_USER_HOST" \
      LOG_DIR="$LOG_DIR" \
      LOG_FILE="$LOG_FILE" \
      MARKER="$MARKER" \
      FULL_HASH="$FULL_HASH" \
      'bash -s' << 'EOF'
set -Eeuo pipefail
touch "$LOG_FILE"
cat "$LOG_DIR/.entry.tmp" "$LOG_FILE" > "$LOG_FILE.new"
mv "$LOG_FILE.new" "$LOG_FILE"
rm -f "$LOG_DIR/.entry.tmp"
printf '%s\n' "$FULL_HASH" > "$MARKER"
EOF
    rm -f "$ENTRY_TMP"
  }

  trap 'on_error $LINENO' ERR

  ######################################
  # 1. Staging directory
  ######################################
  log "➡️  Preparing release directory: $STAGING_DIR"

  ssh "$REMOTE_USER_HOST" \
    RELEASES_DIR="$RELEASES_DIR" \
    STAGING_DIR="$STAGING_DIR" \
    DB_BACKUPS_DIR="$DB_BACKUPS_DIR" \
    'bash -s' << 'EOF'
set -Eeuo pipefail
mkdir -p "$RELEASES_DIR" "$DB_BACKUPS_DIR"
rm -rf "$STAGING_DIR"
mkdir -p "$STAGING_DIR"
EOF

  ######################################
  # 2. Sources + environment
  ######################################
  log "➡️  Uploading API sources"

  rsync -az --delete \
    --exclude ".git" \
    --exclude "node_modules" \
    --exclude ".DS_Store" \
    --exclude "deploy-api.sh" \
    --exclude "ecosystem.config.js" \
    --exclude "ecosystem.config.prod.js" \
    "$SCRIPT_DIR/" "$REMOTE_USER_HOST:$STAGING_DIR/"

  log "➡️  Uploading production environment as ecosystem.config.js"
  # Named ecosystem.config.js on the server because two things look for it there: pm2, and
  # src/db/migrate.js, which reads ../../ecosystem.config.js when HOST/DB_USER/DB are not in the
  # environment — which they are not, in a plain ssh shell.
  scp -q "$LOCAL_ENV_FILE" "$REMOTE_USER_HOST:$STAGING_DIR/ecosystem.config.js"

  ######################################
  # 3. Install
  ######################################
  log "➡️  Installing dependencies on the server"

  ssh "$REMOTE_USER_HOST" \
    STAGING_DIR="$STAGING_DIR" \
    'bash -s' << 'EOF'
set -Eeuo pipefail
export PATH="/home/debian/.npm-global/bin:/home/debian/.local/share/pnpm:/usr/local/bin:/usr/bin:/bin:/usr/sbin:$PATH"

command -v pnpm >/dev/null 2>&1 || { echo "❌ ERROR: pnpm is not installed on the server" >&2; exit 1; }
command -v pm2  >/dev/null 2>&1 || { echo "❌ ERROR: pm2 is not installed on the server" >&2; exit 1; }

cd "$STAGING_DIR"
rm -rf node_modules
pnpm install --frozen-lockfile --prod=false
EOF

  ######################################
  # 4. Dump, then migrate — both from staging, before anything moves
  ######################################
  log "➡️  Taking a named pre-deploy dump (the cron never touches this name)"

  ssh "$REMOTE_USER_HOST" \
    STAGING_DIR="$STAGING_DIR" \
    DUMP_FILE="$DUMP_FILE" \
    'bash -s' << 'EOF'
set -Eeuo pipefail
export PATH="/home/debian/.npm-global/bin:/home/debian/.local/share/pnpm:/usr/local/bin:/usr/bin:/bin:/usr/sbin:$PATH"

cd "$STAGING_DIR"

# The password goes through MYSQL_PWD rather than `-p` on the command line. An option file would
# also work, but the password would then have to be escaped to MySQL's option-file rules — a quote
# or a backslash in it would silently truncate the value, and the dump would fail on an
# authentication error that looks like nothing at all. MYSQL_PWD has no such rules.
DB_HOST=$(node -e 'process.stdout.write(String(require("./ecosystem.config.js").apps[0].env_production.HOST))')
DB_USER=$(node -e 'process.stdout.write(String(require("./ecosystem.config.js").apps[0].env_production.DB_USER))')
DB_NAME=$(node -e 'process.stdout.write(String(require("./ecosystem.config.js").apps[0].env_production.DB))')
MYSQL_PWD=$(node -e 'process.stdout.write(String(require("./ecosystem.config.js").apps[0].env_production.DB_PASSWORD))')
export MYSQL_PWD

# --single-transaction takes the dump from one consistent snapshot without locking the tables, so
# the app keeps serving while it runs.
mysqldump -h "$DB_HOST" -u "$DB_USER" --single-transaction "$DB_NAME" > "$DUMP_FILE"
unset MYSQL_PWD

if [ ! -s "$DUMP_FILE" ]; then
  echo "❌ ERROR: the pre-deploy dump is empty — refusing to migrate" >&2
  exit 1
fi

echo "✅ dump: $DUMP_FILE ($(du -h "$DUMP_FILE" | cut -f1))"
EOF

  log "➡️  Migrations — state before"
  ssh "$REMOTE_USER_HOST" \
    STAGING_DIR="$STAGING_DIR" \
    'bash -s' << 'EOF'
set -Eeuo pipefail
export PATH="/home/debian/.npm-global/bin:/home/debian/.local/share/pnpm:/usr/local/bin:/usr/bin:/bin:/usr/sbin:$PATH"
cd "$STAGING_DIR"
NODE_ENV=production pnpm --silent migrate:status
EOF

  log "➡️  Applying pending migrations"
  ssh "$REMOTE_USER_HOST" \
    STAGING_DIR="$STAGING_DIR" \
    'bash -s' << 'EOF'
set -Eeuo pipefail
export PATH="/home/debian/.npm-global/bin:/home/debian/.local/share/pnpm:/usr/local/bin:/usr/bin:/bin:/usr/sbin:$PATH"
cd "$STAGING_DIR"
NODE_ENV=production pnpm --silent migrate
EOF

  ######################################
  # 5. Atomic switch
  ######################################
  log "➡️  Switching release (previous version kept in backend.bak)"

  ssh "$REMOTE_USER_HOST" \
    BACKEND_DIR="$BACKEND_DIR" \
    BACKEND_BACKUP_DIR="$BACKEND_BACKUP_DIR" \
    STAGING_DIR="$STAGING_DIR" \
    'bash -s' << 'EOF'
set -Eeuo pipefail

if [ ! -f "$STAGING_DIR/package.json" ]; then
  echo "❌ ERROR: staging release is empty (no package.json)" >&2
  exit 1
fi

if [ ! -f "$STAGING_DIR/ecosystem.config.js" ]; then
  echo "❌ ERROR: staging release has no ecosystem.config.js — pm2 and the migration runner both need it" >&2
  exit 1
fi

rm -rf "$BACKEND_BACKUP_DIR"
[ -d "$BACKEND_DIR" ] && mv "$BACKEND_DIR" "$BACKEND_BACKUP_DIR"
mv "$STAGING_DIR" "$BACKEND_DIR"

echo "✅ New API release activated"
EOF

  SWITCH_DONE="true"

  ######################################
  # 6. Restart
  ######################################
  log "➡️  Reloading pm2"
  remote_pm2_reload

  trap - ERR

  write_deploy_log || log "⚠️  Deploy changelog update skipped (non-fatal)"

  log "✅ API deployment completed"
  log "ℹ️  bkmk-server is listening on 5100, proxied by nginx at /api/"
  log "ℹ️  Pre-deploy dump:   $DUMP_FILE"
  log "ℹ️  Previous version:  $BACKEND_BACKUP_DIR"
  log "ℹ️  Releases:          $RELEASES_DIR"
  log "ℹ️  Rollback with:     ./deploy-api.sh rollback"
  log "⚠️  Rollback restores the code, NOT the schema. If a migration has to be undone, the dump above is the way back."
}

rollback() {
  log "↩️  Manual rollback to the previous API version"
  if remote_rollback; then
    remote_pm2_reload
    log "✅ Rollback completed. Previous version is live."
    log "⚠️  The schema was not touched — migrations are not reverted by this."
  else
    log "❌ Rollback failed. Check server state manually."
    exit 1
  fi
}

######################################
# Entry point
######################################
ACTION="${1:-deploy}"

case "$ACTION" in
  deploy)   deploy ;;
  rollback) rollback ;;
  *)
    echo "Usage: $0 [deploy|rollback]"
    exit 1
    ;;
esac
