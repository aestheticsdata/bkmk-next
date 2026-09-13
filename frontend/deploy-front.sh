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
# that is where its Next process already lives. bkmk's public_html holds the *static export* of the
# old front, which nginx served until the vhost was switched. Writing the new app over it would
# have destroyed the running site before nginx had been told to proxy instead of serving files,
# turning the deploy into an outage that only ends when the vhost is edited.
#
# So the new front went to a new directory and nothing broke: public_html kept serving the old site
# until `location /` was switched to proxy_pass, and it stays there as the fastest rollback
# available — point nginx back and reload.
#
# The nginx switch is deliberately NOT in this script. It needs root, and it is the one step that
# should be run by hand with `nginx -t` in front of it. It was done once, and this script used to
# end by warning that it had not been — a fixed string, checking nothing, alarming after every
# successful deploy (BMK-70). `location /` on ks-b proxies to the front's pm2 address; if that ever
# changes, the vhost is where it will say so, not a `log` line here.
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

# Where the front ends up listening, read out of the pm2 ecosystem file beside this script.
#
# ⚠️ **Not written here as a literal.** ZEU-74 moved the front from 3100 to 3001 -- nginx,
# `ecosystem.config.cjs` and Zeus's registry all followed, and the closing `log` line below did not,
# so every successful deploy signed off with the old number. That is BMK-70's defect exactly: a fact
# hard-coded into deploy output that quietly stopped being true. One file decides the address, so
# this reads that file and the next move needs no edit here.
#
# Prints nothing on an unexpected shape rather than guessing: the caller drops the line, and a
# missing address is better than a confident wrong one -- which is the whole point of this change.
front_address() {
  local args port host
  args=$(sed -n 's/.*args:[[:space:]]*"\([^"]*\)".*/\1/p' "$SCRIPT_DIR/$PM2_ECOSYSTEM_FILE" 2>/dev/null | head -1)
  port=$(printf '%s' "$args" | sed -n 's/.*-p[[:space:]]\{1,\}\([0-9]\{1,\}\).*/\1/p')
  host=$(printf '%s' "$args" | sed -n 's/.*-H[[:space:]]\{1,\}\([^[:space:]]\{1,\}\).*/\1/p')
  [ -n "$port" ] || return 1
  printf '%s:%s' "${host:-127.0.0.1}" "$port"
}

######################################
# Reporting to Zeus (BMK-71)
######################################
# bkmk's slug in Zeus's port registry, and which half of it this script deploys. The service is
# already declared on both sides — deploys do not self-register, unlike crons, so an unregistered
# app would be a 400 and not a new row.
ZEUS_APP_NAME="${ZEUS_APP_NAME:-bkmk}"
ZEUS_ROLE="front"

# The two files **on ks-b** that may hold the ingest URL and the shared secret — the **API's**, not
# the front's own `ecosystem.config.cjs` beside it.
#
# Not an oversight: the token belongs to one place per app, and COS-432 put bkmk's in the API's
# production environment because the API is what reports the mysqldump cron. The front validates
# nothing, so it has no claim on a copy, and a secret written twice is two things that can disagree.
ZEUS_ECOSYSTEM_FILE="${ZEUS_ECOSYSTEM_FILE:-$WEB_ROOT_BASE/backend/ecosystem.config.js}"
ZEUS_ENV_FILE="${ZEUS_ENV_FILE:-$WEB_ROOT_BASE/backend/.env}"

# The served changelog and the marker holding the last deployed commit. Hoisted out of
# `write_deploy_log` because the report to Zeus measures its commit range from the same marker, and
# two independent resolutions of one baseline is how they drift apart.
DEPLOY_LOG_DIR="$WEB_ROOT_BASE/deploy-logs"
DEPLOY_LOG_FILE="$DEPLOY_LOG_DIR/deploys-$ZEUS_ROLE.txt"
DEPLOY_MARKER="$DEPLOY_LOG_DIR/.last-$ZEUS_ROLE"

######################################
# Utility functions
######################################

log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $*"
}

# The commit the previous deploy shipped — the base of this deploy's commit range.
#
# Resolved **once, before anything writes**: `write_deploy_log` moves the marker at the end of a
# successful deploy, so a second resolution later in the run would return this deploy's own commit
# and both the changelog and the report would come out claiming nothing shipped.
#
# A hash this checkout does not have is no baseline at all — a shallow clone, or a marker left by a
# deploy from a branch since rewritten.
resolve_base_hash() {
  local base
  base=$(ssh "$REMOTE_USER_HOST" "cat '$DEPLOY_MARKER' 2>/dev/null || true" 2>/dev/null || true)
  [ -z "$base" ] && base="${BKMK_SINCE:-}"

  if [ -n "$base" ] && ! git cat-file -e "${base}^{commit}" 2>/dev/null; then
    base=""
  fi

  printf '%s' "$base"
}

# The commits this deploy ships, as a JSON array, newest first.
#
# With no baseline — a first report — the last ten commits stand in for a range nobody can
# reconstruct, which is the baseline the changelog already uses.
#
# Every message is escaped in awk rather than interpolated into a shell string. `%s` is the subject
# line only, so it cannot contain a newline, and splitting on the first two spaces is exact because
# neither a sha nor an ISO-8601 date contains one.
zeus_commits_json() {
  local -a range

  # A manual rollback restores a release rather than shipping one. Falling through to the last-ten
  # baseline there would claim it delivered ten commits it had nothing to do with.
  if [ "${ZEUS_REPORT_COMMITS:-true}" != "true" ]; then
    printf '[]'
    return 0
  fi

  if [ -n "${ZEUS_BASE_HASH:-}" ]; then
    range=("${ZEUS_BASE_HASH}..HEAD")
  else
    range=(-n 10 HEAD)
  fi

  git log --no-merges --pretty=format:'%H %aI %s' "${range[@]}" 2>/dev/null | awk '
    BEGIN { printf "["; first = 1 }
    NF >= 3 {
      sha = $1
      when = $2
      msg = substr($0, length(sha) + length(when) + 3)
      gsub(/\\/, "\\\\", msg)
      gsub(/"/, "\\\"", msg)
      gsub(/\t/, " ", msg)
      if (!first) printf ","
      printf "{\"sha\":\"%s\",\"authoredAt\":\"%s\",\"message\":\"%s\"}", sha, when, msg
      first = 0
    }
    END { printf "]" }'
}

# Escape a value for a JSON string literal. Applied to every field rather than to the ones that look
# risky, so nothing here needs re-deciding: a summary is one `zeus_report "failed" "could not read
# \"x\""` away from posting malformed JSON, Zeus would answer 400, and since every error on this
# path is swallowed the report would vanish with no symptom.
#
# Backslash first: the reverse order would escape the backslashes this step adds. Commit subjects
# and git ref names cannot contain a newline, so tab is the only control character left.
json_escape() {
  local s="$1"
  s=${s//\\/\\\\}
  s=${s//\"/\\\"}
  s=${s//$'\t'/ }
  printf '%s' "$s"
}

# Tell Zeus what this deploy did: `zeus_report <success|failed|rolled_back> [summary]`.
#
# Three rules, from `~/dev/Zeus/docs/reporting/README.md`, and none of them is optional:
#   1. reporting must never fail the deploy — every step here is `|| true`, and the caller ignores
#      the return value too;
#   2. fire and forget, 2 second timeout, no retries;
#   3. the payload travels as a **file**, never interpolated into a shell command, because commit
#      messages contain quotes, backticks and `$`.
#
# The POST happens on ks-b over ssh rather than from here: the endpoint is loopback-only, and Zeus's
# nginx block denies it from outside the box.
zeus_report() {
  local status="$1"
  local summary="${2:-}"
  local commits payload remote_payload duration

  commits=$(zeus_commits_json 2>/dev/null || echo "[]")
  duration=$(( ($(date +%s) - ${ZEUS_STARTED_EPOCH:-$(date +%s)}) * 1000 ))
  payload=$(mktemp)
  remote_payload="/tmp/.zeus-deploy-report.$$.json"

  {
    printf '{"app":"%s","role":"%s","status":"%s"' \
      "$(json_escape "$ZEUS_APP_NAME")" "$(json_escape "$ZEUS_ROLE")" "$(json_escape "$status")"
    printf ',"startedAt":"%s","durationMs":%s' "$(json_escape "${ZEUS_STARTED_AT}")" "$duration"
    [ -n "${ZEUS_RELEASE:-}" ] && printf ',"release":"%s"' "$(json_escape "$ZEUS_RELEASE")"
    [ -n "${ZEUS_COMMIT:-}" ] && printf ',"commit":"%s"' "$(json_escape "$ZEUS_COMMIT")"
    [ -n "${ZEUS_BRANCH:-}" ] && printf ',"branch":"%s"' "$(json_escape "$ZEUS_BRANCH")"
    [ -n "$summary" ] && printf ',"summary":"%s"' "$(json_escape "$summary")"
    printf ',"commits":%s}' "$commits"
  } > "$payload"

  scp -q "$payload" "$REMOTE_USER_HOST:$remote_payload" || { rm -f "$payload"; return 0; }
  rm -f "$payload"

  ssh "$REMOTE_USER_HOST" \
    ZEUS_ECOSYSTEM_FILE="$ZEUS_ECOSYSTEM_FILE" \
    ZEUS_ENV_FILE="$ZEUS_ENV_FILE" \
    PAYLOAD="$remote_payload" \
    'bash -s' << 'EOF' || true
set -uo pipefail

cleanup() { rm -f "$PAYLOAD"; }
trap cleanup EXIT

# One setting, looked for in the pm2 ecosystem file first and the `.env` second — the order the API
# itself resolves them. pm2 injects `env_production` before node starts and dotenv does not
# overwrite a variable that is already there, so the ecosystem file wins and the `.env` is only
# consulted when it is silent. Reading the `.env` alone would present a token the API is not
# validating against the day the two disagree: a 401 on every report and no other symptom.
#
# Neither value is ever defaulted. A fallback URL would put Zeus's port in this repo, the one place
# a port reassignment cannot rewrite — and since every error here is swallowed, a stale default
# fails quietly and forever.
#
# `\042` and `\047` are the double and single quote, so a value written either way is unwrapped
# without this needing quotes of its own inside a heredoc.
read_setting() {
  local key="$1" value=""

  if [ -f "$ZEUS_ECOSYSTEM_FILE" ]; then
    value=$(sed -n "s/.*${key}: *['\"]\([^'\"]*\)['\"].*/\1/p" "$ZEUS_ECOSYSTEM_FILE" 2>/dev/null | tail -1)
  fi

  if [ -z "$value" ] && [ -f "$ZEUS_ENV_FILE" ]; then
    value=$(sed -n "s/^${key}=//p" "$ZEUS_ENV_FILE" 2>/dev/null | tail -1 | tr -d '\042\047')
  fi

  printf '%s' "$value"
}

url=$(read_setting ZEUS_DEPLOY_INGEST_URL)
token=$(read_setting ZEUS_INGEST_TOKEN)

if [ -z "$url" ] || [ -z "$token" ]; then
  echo "zeus: not reported — ZEUS_DEPLOY_INGEST_URL or ZEUS_INGEST_TOKEN found in neither" \
    "$ZEUS_ECOSYSTEM_FILE nor $ZEUS_ENV_FILE"
  exit 0
fi

code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 2 \
  -X POST "$url" \
  -H 'content-type: application/json' \
  -H "authorization: Bearer $token" \
  --data-binary @"$PAYLOAD" || true)

# 202 is the contract. Anything else is worth one line in the deploy output and nothing more —
# a deploy that shipped and could not say so still shipped.
[ "$code" = "202" ] || echo "zeus: report not recorded (HTTP ${code:-none})"
EOF
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

# The pnpm version is deliberately not written down here. Each project pins it
# in package.json ("packageManager") and both machines switch to that version on
# their own. What this guards is the *baseline* pnpm — the binary that performs
# the switch. A server baseline older than this machine's may not honour the pin
# at all, in which case the build would quietly run on the wrong pnpm.
#
# npm_config_manage_package_manager_versions=false bypasses the pin: without it
# both sides would report the pinned version and the comparison would prove
# nothing. It has to be the environment variable — the equivalent
# `--config.manage-package-manager-versions=false` flag is silently ignored
# here, because the version switch happens before flags are parsed.
check_pnpm_baseline() {
  local local_v remote_v oldest

  local_v=$(npm_config_manage_package_manager_versions=false pnpm -v 2>/dev/null) || {
    echo "❌ ERROR: pnpm not found on this machine" >&2
    exit 1
  }

  remote_v=$(ssh "$REMOTE_USER_HOST" \
    'export PATH="$HOME/.local/share/pnpm:$PATH"; npm_config_manage_package_manager_versions=false pnpm -v' \
    2>/dev/null) || {
    echo "❌ ERROR: pnpm not found on the server" >&2
    exit 1
  }

  oldest=$(printf '%s\n%s\n' "$local_v" "$remote_v" | sort -V | head -1)
  if [ "$remote_v" != "$local_v" ] && [ "$oldest" = "$remote_v" ]; then
    echo "❌ ERROR: the server's pnpm ($remote_v) is older than this machine's ($local_v)." >&2
    echo "   Update pnpm on the server before deploying." >&2
    exit 1
  fi

  log "➡️  pnpm baseline — local $local_v / server $remote_v"
}

deploy() {
  check_pnpm_baseline
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

  # What the report to Zeus will carry (BMK-71), gathered here so that a deploy which fails at its
  # very first step still reports something true. Not `local`: `zeus_report` is defined outside this
  # function, and the failure path calls it from the ERR trap.
  ZEUS_STARTED_AT=$(date -u +%FT%TZ)
  ZEUS_STARTED_EPOCH=$(date +%s)
  ZEUS_RELEASE="$RELEASE_NAME"
  ZEUS_BRANCH="$GIT_BRANCH_RAW"
  ZEUS_COMMIT=$(git rev-parse HEAD 2>/dev/null || true)
  ZEUS_BASE_HASH=$(resolve_base_hash)

  on_error() {
    local lineno=$1
    log "❌ ERROR: front deployment failed at line $lineno"

    if [[ "$SWITCH_DONE" == "true" ]]; then
      log "↩️  Auto rollback: restoring previous front"
      if remote_rollback; then
        remote_pm2_reload || true
        log "✅ Auto rollback succeeded"
        # `rolled_back`, not `failed`, and the distinction is the whole reason Zeus has three
        # statuses: the deploy did fail, and the box is serving exactly what it served before.
        zeus_report "rolled_back" "deploy failed at line $lineno — previous release restored" || true
      else
        log "❌ Auto rollback failed, manual intervention required"
        zeus_report "failed" "deploy failed at line $lineno — rollback failed too" || true
      fi
    else
      log "ℹ️  No rollback needed: the live front was not modified yet"
      zeus_report "failed" "deploy failed at line $lineno — the live front was not modified" || true
    fi
  }

  write_deploy_log() {
    local LOG_DIR="$DEPLOY_LOG_DIR"
    local LOG_FILE="$DEPLOY_LOG_FILE"
    local MARKER="$DEPLOY_MARKER"
    local FULL_HASH WHEN PREV_HASH TICKETS COMMITS ENTRY_TMP
    local -a RANGE
    FULL_HASH=$(git rev-parse HEAD)
    WHEN=$(date +'%Y-%m-%d %H:%M:%S')

    # The baseline was resolved once, at the top of the deploy, and the report to Zeus reads the
    # same value — see `resolve_base_hash`.
    PREV_HASH="${ZEUS_BASE_HASH:-}"
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

  zeus_report "success" || log "⚠️  Zeus was not told about this deploy (non-fatal)"

  log "✅ Front deployment completed"
  if FRONT_ADDRESS=$(front_address); then
    log "ℹ️  bkmk-front is listening on $FRONT_ADDRESS"
  fi
  log "ℹ️  Previous version: $BACKUP_DIR"
  log "ℹ️  Releases:         $RELEASES_DIR"
  log "ℹ️  Rollback with:    ./deploy-front.sh rollback"
}

rollback() {
  log "↩️  Manual rollback to the previous front"

  # A rollback restores a release, it does not ship one — hence no commit range, and no `release`
  # either: what comes back is whatever front.bak holds, which this script never named.
  ZEUS_STARTED_AT=$(date -u +%FT%TZ)
  ZEUS_STARTED_EPOCH=$(date +%s)
  ZEUS_REPORT_COMMITS="false"

  if remote_rollback; then
    remote_pm2_reload
    log "✅ Rollback completed. Previous version is live."
    zeus_report "rolled_back" "manual rollback — the previous release is live again" || true
  else
    log "❌ Rollback failed. Check server state manually."
    zeus_report "failed" "manual rollback failed — the box needs looking at" || true
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
