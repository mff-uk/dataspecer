#!/bin/bash

npm install

printf "REACT_APP_BACKEND=$BACKEND\nREACT_APP_DEBUG_VERSION=$CF_PAGES_BRANCH@$(echo $CF_PAGES_COMMIT_SHA | head -c7) $(date -u +%F\ %H:%M:%S)" > applications/schema-generator/.env.local
printf "REACT_APP_BACKEND=$BACKEND\nREACT_APP_SCHEMA_GENERATOR=/editor/\nREACT_APP_DEBUG_VERSION=$CF_PAGES_BRANCH@$(echo $CF_PAGES_COMMIT_SHA | head -c7) $(date -u +%F\ %H:%M:%S)" > applications/specification-manager/.env.local

lerna bootstrap --scope specification-manager --scope schema-generator --include-dependencies
lerna run build --scope specification-manager --scope schema-generator --include-dependencies

rm -rf .dist
mkdir .dist
mkdir .dist/editor

cp -r applications/specification-manager/build/* .dist
cp -r applications/schema-generator/build/* .dist/editor
