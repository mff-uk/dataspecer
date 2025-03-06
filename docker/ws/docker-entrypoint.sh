#!/bin/sh

set -e

function prepareDatabase {
  # Prepare database
  echo "📦 Preparing/checking database"
  mkdir -p /usr/src/app/database/stores
  bunx prisma migrate deploy --schema dist/schema.prisma
}

if [ $# -gt 0 ]; then
  prepareDatabase
  node dist/backend-bundle.js "$@"
else
  NORMALIZED_URL=$(echo "${BASE_URL:=http://localhost}" | sed 's:/*$::')
  echo "📄 Starting Dataspecer webservice Docker container on $NORMALIZED_URL"

  # Prepare frontend for nginx
  echo "🌍 Preparing frontend"
  BASE_PATH=$(echo $NORMALIZED_URL | awk -F[/] '{for (i=4; i<=NF; i++) printf "/%s", $i; print ""}')
  mkdir -p /usr/src/app/html
  cp -r /usr/src/app/html-template/* /usr/src/app/html
  find /usr/src/app/html/ -type f -exec sed -i "s|/_BASE_PATH_DOCKER_REPLACE__|$BASE_PATH|g" {} \;

  prepareDatabase

  env PORT=80 BASE_NAME=$NORMALIZED_URL STATIC_FILES_PATH=/usr/src/app/html/ bun dist/main.js
fi