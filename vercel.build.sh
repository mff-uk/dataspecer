#!/bin/bash

npm install

printf "REACT_APP_BACKEND=$BACKEND\nREACT_APP_DEBUG_VERSION=$VERCEL_GIT_COMMIT_REF@$(echo $VERCEL_GIT_COMMIT_SHA | head -c7) $(date -u +%F\ %H:%M:%S)" > applications/schema-generator/.env.local
printf "REACT_APP_BACKEND=$BACKEND\nREACT_APP_BASENAME=/manager/\nREACT_APP_SCHEMA_GENERATOR=/editor/\nREACT_APP_DEBUG_VERSION=$VERCEL_GIT_COMMIT_REF@$(echo $VERCEL_GIT_COMMIT_SHA | head -c7) $(date -u +%F\ %H:%M:%S)" > applications/specification-manager/.env.local

lerna bootstrap --scope specification-manager --scope schema-generator --include-dependencies

sed -i '1 a "homepage": "/manager/",' applications/specification-manager/package.json

lerna run build --scope specification-manager --scope schema-generator --include-dependencies

rm -rf .dist
mkdir .dist
mkdir .dist/manager
mkdir .dist/editor

cp -r applications/specification-manager/build/* .dist/manager
cp -r applications/schema-generator/build/* .dist/editor
