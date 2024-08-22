#!/bin/bash

set -e

NORMALIZED_URL=$(echo "${BASE_URL:=http://localhost}" | sed 's:/*$::')
echo "📄 Starting Dataspecer webservice Docker container on $NORMALIZED_URL"

# Create user for running the application
USER_ID=${USER:=0}
adduser -u $USER_ID -D -H user > /dev/null 2>&1 || true

# Prepare frontend for nginx
echo "🌍 Preparing frontend"
BASE_PATH=$(echo $NORMALIZED_URL | awk -F[/:] '{for (i=5; i<=NF; i++) printf "/%s", $i; print ""}')
cp -r /usr/share/nginx/html-template/* /usr/share/nginx/html
find /usr/share/nginx/html/ -type f -exec sed -i "s|/_BASE_PATH_DOCKER_REPLACE__|$BASE_PATH|g" {} \;

# Prepare database
echo "📦 Preparing database"
sudo -u \#$USER_ID mkdir -p /usr/src/app/database/stores
sudo -u \#$USER_ID npx prisma migrate deploy --schema dist/schema.prisma

nginx -g "daemon off;" &

sudo -u \#$USER_ID env PORT=3000 HOST=$NORMALIZED_URL/api BASENAME_OVERRIDE= node dist/backend-bundle.js  &

# Wait for any process to exit
wait -n

# Exit with status of process that exited first
exit $?