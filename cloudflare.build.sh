#!/bin/bash

npm install

printf "REACT_APP_BACKEND=$BACKEND\nREACT_APP_DEBUG_VERSION=$CF_PAGES_BRANCH@$(echo $CF_PAGES_COMMIT_SHA | head -c7) $(date -u +%F\ %H:%M:%S)" > applications/editor/.env.local
printf "REACT_APP_BACKEND=$BACKEND\nREACT_APP_EDITOR=/editor/\nREACT_APP_DEBUG_VERSION=$CF_PAGES_BRANCH@$(echo $CF_PAGES_COMMIT_SHA | head -c7) $(date -u +%F\ %H:%M:%S)" > applications/manager/.env.local

lerna bootstrap --scope manager --scope editor --include-dependencies
lerna run build --scope manager --scope editor --include-dependencies

rm -rf .dist
mkdir .dist
mkdir .dist/editor

cp -r applications/manager/build/* .dist
cp -r applications/editor/build/* .dist/editor
