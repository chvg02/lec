#!/bin/sh
set -eu

BACKUP_DIR="${BACKUP_DIR:-/backups}"
UPLOADS_DIR="${UPLOADS_DIR:-/uploads}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-7}"
INTERVAL_SECONDS="${BACKUP_INTERVAL_SECONDS:-86400}"

run_backup() {
  timestamp="$(date +%Y%m%d-%H%M%S)"
  target_dir="${BACKUP_DIR}/${timestamp}"

  mkdir -p "${target_dir}"

  echo "Waiting for database..."
  until pg_isready -h "${PGHOST}" -p "${PGPORT:-5432}" -U "${PGUSER}" -d "${PGDATABASE}"; do
    sleep 2
  done

  echo "Creating database backup ${timestamp}..."
  pg_dump \
    -h "${PGHOST}" \
    -p "${PGPORT:-5432}" \
    -U "${PGUSER}" \
    -d "${PGDATABASE}" \
    --format=custom \
    --no-owner \
    --no-privileges \
    --file="${target_dir}/database.dump"

  echo "Creating uploads backup ${timestamp}..."
  if [ -d "${UPLOADS_DIR}" ]; then
    tar -czf "${target_dir}/uploads.tar.gz" -C "${UPLOADS_DIR}" .
  else
    tar -czf "${target_dir}/uploads.tar.gz" --files-from /dev/null
  fi

  cat > "${target_dir}/metadata.txt" <<EOF
created_at=${timestamp}
database=${PGDATABASE}
uploads_dir=${UPLOADS_DIR}
EOF

  echo "Removing backups older than ${RETENTION_DAYS} day(s)..."
  find "${BACKUP_DIR}" -mindepth 1 -maxdepth 1 -type d -mtime +"${RETENTION_DAYS}" -exec rm -rf {} \;

  echo "Backup finished: ${target_dir}"
}

if [ "${BACKUP_ONCE:-false}" = "true" ]; then
  run_backup
  exit 0
fi

while true; do
  run_backup
  echo "Next backup in ${INTERVAL_SECONDS} second(s)."
  sleep "${INTERVAL_SECONDS}"
done
