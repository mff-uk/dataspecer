#!/bin/bash

npm install

printf "REACT_APP_BACKEND=$BACKEND\nREACT_APP_DEBUG_VERSION=$CF_PAGES_BRANCH@$(echo $CF_PAGES_COMMIT_SHA | head -c7) $(date -u +%F\ %H:%M:%S)" > applications/client/.env.local

lerna bootstrap --scope client --include-dependencies
lerna run build --scope client --include-dependencies

rm -rf .dist
mkdir .dist

cp -r applications/client/build/* .dist
