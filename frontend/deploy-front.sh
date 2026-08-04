#!/usr/bin/env bash
set -Eeuo pipefail

######################################
# bkmk front deploy (COS-411)
#
# Adapted from ~/dev/pfa/front/deploy-front.sh: sources rsync'd to a timestamped release, built on
# the server, switched atomically with the previous version kept in .bak, pm2 reloaded, changelog
# written.
#
# ⚠️ **It deploys to `front/`, not to `public_html/`.** pfa's script overwrites public_html because
# that is where its Next process already lives. bkmk's public_html still holds the *static export*
# of the old front, which is what nginx is serving right now. Writing the new app over it would
# destroy the running site before nginx has been told to proxy instead of serving files, turning
# the deploy into an outage that only ends when the vhost is edited.
#
# So the new front goes to a new directory and nothing breaks: public_html keeps serving the old
# site until `location /` is switched to proxy_pass, and it stays there afterwards as the fastest
# rollback available — point nginx back and reload.
#
# The nginx switch is deliberately NOT in this script. It needs root, and it is the one step that
# should be run by hand with `nginx -t` in front of it.
######################################

######################################
# Configuration
######################################
REMOTE_USER_HOST="debian@ks-b"

WEB_ROOT_BASE="/var/www/bkmk"
CURRENT_DIR="$WEB_ROOT_BASE/front"
BACKUP_DIR="$WEB_ROOT_BASE/front.bak"
RELEASES_DIR="$WEB_ROOT_BASE/front-releases"
PM2_ECOSYSTEM_FILE="ecosystem.config.cjs"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

######################################
# Utility functions
######################################

log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $*"
}

remote_pm2_reload() {
  ssh "$REMOTE_USER_HOST" \
    CURRENT_DIR="$CURRENT_DIR" \
    PM2_ECOSYSTEM_FILE="$PM2_ECOSYSTEM_FILE" \
    'bash -s' << 'EOF'
set -Eeuo pipefail
export PATH="/home/debian/.npm-global/bin:/home/debian/.local/share/pnpm:/usr/local/bin:/usr/bin:/bin:/usr/sbin:$PATH"

cd "$CURRENT_DIR"

if [ ! -f "$PM2_ECOSYSTEM_FILE" ]; then
  echo "❌ ERROR: missing $CURRENT_DIR/$PM2_ECOSYSTEM_FILE" >&2
  exit 1
fi

pm2 startOrReload "$CURRENT_DIR/$PM2_ECOSYSTEM_FILE" --update-env
pm2 save
EOF
}

remote_rollback() {
  ssh "$REMOTE_USER_HOST" \
    CURRENT_DIR="$CURRENT_DIR" \
    BACKUP_DIR="$BACKUP_DIR" \
    'bash -s' << 'EOF'
set -Eeuo pipefail

if [ ! -d "$BACKUP_DIR" ]; then
  echo "❌ ERROR: no backup directory at $BACKUP_DIR" >&2
  exit 1
fi

rm -rf "$CURRENT_DIR"
mv "$BACKUP_DIR" "$CURRENT_DIR"

echo "✅ front rollback done on server (restored from backup)"
EOF
}

deploy() {
  cd "$SCRIPT_DIR"

  if [ ! -f "$SCRIPT_DIR/$PM2_ECOSYSTEM_FILE" ]; then
    echo "❌ ERROR: missing $SCRIPT_DIR/$PM2_ECOSYSTEM_FILE" >&2
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
  local SWITCH_DONE="false"

  on_error() {
    local lineno=$1
    log "❌ ERROR: front deployment failed at line $lineno"

    if [[ "$SWITCH_DONE" == "true" ]]; then
      log "↩️  Auto rollback: restoring previous front"
      if remote_rollback; then
        remote_pm2_reload || true
        log "✅ Auto rollback succeeded"
      else
        log "❌ Auto rollback failed, manual intervention required"
      fi
    else
      log "ℹ️  No rollback needed: the live front was not modified yet"
    fi
  }

  write_deploy_log() {
    local APP="front"
    local LOG_DIR="$WEB_ROOT_BASE/deploy-logs"
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
    'bash -s' << 'EOF'
set -Eeuo pipefail
mkdir -p "$RELEASES_DIR"
rm -rf "$STAGING_DIR"
mkdir -p "$STAGING_DIR"
EOF

  ######################################
  # 2. Sources
  ######################################
  log "➡️  Uploading front sources (without node_modules, .next, .env*.local)"

  rsync -az --delete \
    --exclude ".git" \
    --exclude ".next" \
    --exclude "node_modules" \
    --exclude "out" \
    --exclude ".env.local" \
    --exclude ".env*.local" \
    --exclude ".DS_Store" \
    --exclude "deploy-front.sh" \
    --exclude "tsconfig.tsbuildinfo" \
    "$SCRIPT_DIR/" "$REMOTE_USER_HOST:$STAGING_DIR/"

  ######################################
  # 3. Install + build, in staging, while the old site stays up
  ######################################
  log "➡️  Installing and building on the server"

  ssh "$REMOTE_USER_HOST" \
    STAGING_DIR="$STAGING_DIR" \
    PM2_ECOSYSTEM_FILE="$PM2_ECOSYSTEM_FILE" \
    'bash -s' << 'EOF'
set -Eeuo pipefail
export PATH="/home/debian/.npm-global/bin:/home/debian/.local/share/pnpm:/usr/local/bin:/usr/bin:/bin:/usr/sbin:$PATH"

command -v pnpm >/dev/null 2>&1 || { echo "❌ ERROR: pnpm is not installed on the server" >&2; exit 1; }
command -v pm2  >/dev/null 2>&1 || { echo "❌ ERROR: pm2 is not installed on the server" >&2; exit 1; }

cd "$STAGING_DIR"

pnpm install --frozen-lockfile
pnpm build

# `next start` serves .next/ — if the build produced nothing, the switch would put an empty app
# live and pm2 would report it as online.
if [ ! -d ".next" ]; then
  echo "❌ ERROR: build produced no .next directory" >&2
  exit 1
fi

if [ ! -f "$PM2_ECOSYSTEM_FILE" ]; then
  echo "❌ ERROR: missing $PM2_ECOSYSTEM_FILE in the release" >&2
  exit 1
fi
EOF

  ######################################
  # 4. Atomic switch
  ######################################
  log "➡️  Switching release (previous version kept in front.bak)"

  ssh "$REMOTE_USER_HOST" \
    CURRENT_DIR="$CURRENT_DIR" \
    BACKUP_DIR="$BACKUP_DIR" \
    STAGING_DIR="$STAGING_DIR" \
    'bash -s' << 'EOF'
set -Eeuo pipefail

rm -rf "$BACKUP_DIR"
[ -d "$CURRENT_DIR" ] && mv "$CURRENT_DIR" "$BACKUP_DIR"
mv "$STAGING_DIR" "$CURRENT_DIR"

echo "✅ New front release activated"
EOF

  SWITCH_DONE="true"

  ######################################
  # 5. Start / reload
  ######################################
  log "➡️  Reloading pm2"
  remote_pm2_reload

  trap - ERR

  write_deploy_log || log "⚠️  Deploy changelog update skipped (non-fatal)"

  log "✅ Front deployment completed"
  log "ℹ️  bkmk-front is listening on 127.0.0.1:3100"
  log "ℹ️  Previous version: $BACKUP_DIR"
  log "ℹ️  Releases:         $RELEASES_DIR"
  log "ℹ️  Rollback with:    ./deploy-front.sh rollback"
  log "⚠️  nginx is NOT switched by this script. Until 'location /' proxies to 127.0.0.1:3100,"
  log "⚠️  the site still serves the old static export from public_html."
}

rollback() {
  log "↩️  Manual rollback to the previous front"
  if remote_rollback; then
    remote_pm2_reload
    log "✅ Rollback completed. Previous version is live."
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
