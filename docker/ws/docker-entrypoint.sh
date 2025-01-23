#!/bin/bash

set -e

USER_ID=${USER:=0}

function createUser {
  # Create user for running the application
  useradd -u $USER_ID user_$USER_ID > /dev/null 2>&1 || true
}

function prepareDatabase {
  # Prepare database
  echo "📦 Preparing database"
  sudo -u \#$USER_ID mkdir -p /usr/src/app/database/stores
  sudo -u \#$USER_ID npx prisma migrate deploy --schema dist/schema.prisma
}

if [ $# -gt 0 ]; then
  createUser
  prepareDatabase
  sudo -u \#$USER_ID node dist/backend-bundle.js "$@"
else
  NORMALIZED_URL=$(echo "${BASE_URL:=http://localhost}" | sed 's:/*$::')
  echo "📄 Starting Dataspecer webservice Docker container on $NORMALIZED_URL"

  createUser

  # Prepare frontend for nginx
  echo "🌍 Preparing frontend"
  BASE_PATH=$(echo $NORMALIZED_URL | awk -F[/] '{for (i=4; i<=NF; i++) printf "/%s", $i; print ""}')
  cp -r /usr/share/nginx/html-template/* /usr/share/nginx/html
  find /usr/share/nginx/html/ -type f -exec sed -i "s|/_BASE_PATH_DOCKER_REPLACE__|$BASE_PATH|g" {} \;

  # Prepare nginx
  sed "s|__BASE_PATH__|$BASE_PATH|g" /etc/nginx/nginx.conf-template > /etc/nginx/nginx.conf

  prepareDatabase

  nginx -g "daemon off;" &

  sudo -u \#$USER_ID env PORT=3000 HOST=$NORMALIZED_URL/api BASENAME_OVERRIDE= node dist/backend-bundle.js  &

  # Wait for any process to exit
  wait -n

  # Exit with status of process that exited first
  exit $?
fi