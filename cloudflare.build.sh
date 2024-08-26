#!/bin/bash

set -e # Exit with nonzero exit code if anything fails

if [ -n "$USE_NEW_MANAGER" ]; then
  NEW_MANAGER="/"
  OLD_MANAGER="/data-specification-manager"
else
  NEW_MANAGER="/manager"
  OLD_MANAGER=""
fi

npm install

printf "REACT_APP_BACKEND=$BACKEND\nREACT_APP_DEBUG_VERSION=$CF_PAGES_BRANCH@$(echo $CF_PAGES_COMMIT_SHA | head -c7) $(date -u +%F\ %H:%M:%S)\nREACT_APP_MANAGER_BASE_URL=$OLD_MANAGER\nREACT_APP_WIKIDATA_ONTOLOGY_BACKEND=$WIKIDATA_ONTOLOGY_BACKEND\n" > applications/client/.env.local

printf "NEXT_PUBLIC_BASE_PATH=/conceptual-model-editor\nNEXT_PUBLIC_APP_BACKEND=$BACKEND\nNEXT_PUBLIC_APP_BACKEND_PACKAGE_ROOT=http://dataspecer.com/packages/local-root\nNEXT_PUBLIC_MANAGER_PATH=$NEW_MANAGER\nNEXT_PUBLIC_DSCME_LOGO_LINK=$NEW_MANAGER\n" > applications/conceptual-model-editor/.env.local
# Autosave configuration.
printf "NEXT_PUBLIC_APP_AUTOSAVE_INTERVAL_MS=15000\nNEXT_PUBLIC_APP_AUTOSAVE_ENABLED_BY_DEFAULT=1\n" >> applications/conceptual-model-editor/.env.local

printf "VITE_BACKEND=$BACKEND\nVITE_CME=/conceptual-model-editor\nVITE_API_SPECIFICATION_APPLICATION=/api-specification\nVITE_SCHEMA_EDITOR=/editor\n" > applications/manager/.env.local

printf "VITE_BACKEND=$BACKEND\n" > applications/api-specification/.env.local

if [ $CF_PAGES_BRANCH != "main" ]; then
  printf "VITE_VERSION=$CF_PAGES_BRANCH\n" >> applications/manager/.env.local
fi

npx turbo run build --filter=client --filter=conceptual-model-editor --filter=manager --filter=api-specification --filter=genapp

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

# Copy genapp application
mkdir .dist/genapp
cp -r applications/genapp/dist/* .dist/genapp
