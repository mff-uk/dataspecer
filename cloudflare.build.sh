#!/bin/bash

# This is a build script that was originally created for Cloudflare Pages. The purpose was to build all applications and copy the output to a single directory .dist, that could be served by Cloudflare Pages.
# However, its purpose was later extended to be used in Docker containers as well.

# BACKEND - URL to the backend server
# DO_BUILD_BACKEND - Whether the backend should be built
# BASE_PATH - Should not end with a slash (keep empty for root)

set -e # Exit with nonzero exit code if anything fails

if [ -n "$USE_NEW_MANAGER" ]; then
  NEW_MANAGER="/"
  OLD_MANAGER="/data-specification-manager"
else
  NEW_MANAGER="/manager"
  OLD_MANAGER=""
fi

npm ci

printf "REACT_APP_BACKEND=$BACKEND\nREACT_APP_DEBUG_VERSION=$CF_PAGES_BRANCH@$(echo $CF_PAGES_COMMIT_SHA | head -c7) $(date -u +%F\ %H:%M:%S)\nREACT_APP_MANAGER_BASE_URL=$BASE_PATH$OLD_MANAGER\nREACT_APP_WIKIDATA_ONTOLOGY_BACKEND=$WIKIDATA_ONTOLOGY_BACKEND\nREACT_APP_STRUCTURE_EDITOR_BASE_URL=$BASE_PATH/editor\n" > applications/client/.env.local

printf "NEXT_PUBLIC_BASE_PATH=$BASE_PATH/conceptual-model-editor\nNEXT_PUBLIC_APP_BACKEND=$BACKEND\nNEXT_PUBLIC_APP_BACKEND_PACKAGE_ROOT=http://dataspecer.com/packages/local-root\nNEXT_PUBLIC_MANAGER_PATH=$BASE_PATH$NEW_MANAGER\nNEXT_PUBLIC_DSCME_LOGO_LINK=$BASE_PATH$NEW_MANAGER\n" > applications/conceptual-model-editor/.env.local
# Autosave configuration.
printf "NEXT_PUBLIC_APP_AUTOSAVE_INTERVAL_MS=15000\nNEXT_PUBLIC_APP_AUTOSAVE_ENABLED_BY_DEFAULT=1\n" >> applications/conceptual-model-editor/.env.local

printf "VITE_BACKEND=$BACKEND\nVITE_CME=$BASE_PATH/conceptual-model-editor\nVITE_API_SPECIFICATION_APPLICATION=$BASE_PATH/api-specification\nVITE_SCHEMA_EDITOR=$BASE_PATH/editor\n" > applications/manager/.env.local

printf "VITE_BACKEND=$BACKEND\n" > applications/api-specification/.env.local

if [ $CF_PAGES_BRANCH != "main" ]; then
  printf "VITE_VERSION=$CF_PAGES_BRANCH\n" >> applications/manager/.env.local
fi

if [ -n "$BASE_PATH" ]; then
  sed -i "2i\  \"homepage\": \"$BASE_PATH\"," applications/client/package.json
fi

if [ -n "$DO_BUILD_BACKEND" ]; then
  npx turbo run build --concurrency 100% --filter=client --filter=conceptual-model-editor --filter=manager --filter=api-specification --filter=genapp-ui --filter=backend^...
  (cd services/backend && npx npm run build-pack)
else
  npx turbo run build --concurrency 100% --filter=client --filter=conceptual-model-editor --filter=manager --filter=api-specification --filter=genapp-ui
fi

rm -rf .dist

# Copy client application
mkdir .dist
cp -r applications/client/build/* .dist

if [ -n "$USE_NEW_MANAGER" ]; then
  # Hack: If old manager is not in root. Needs to be configured in you webserver
  mv .dist/index.html .dist/old-manager.html
fi

# Copy conceptual-model-editor application
mkdir .dist/conceptual-model-editor
cp -r applications/conceptual-model-editor/out/* .dist/conceptual-model-editor

# Copy manager application
mkdir .dist/manager
cp -r applications/manager/dist/* .dist$NEW_MANAGER

# Copy api-specification application
mkdir .dist/api-specification
cp -r applications/api-specification/dist/* .dist/api-specification

# Copy genapp-ui application
mkdir .dist/genapp-ui
cp -r applications/genapp-ui/dist/* .dist/genapp-ui
