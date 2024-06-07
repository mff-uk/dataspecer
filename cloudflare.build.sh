#!/bin/bash

set -e # Exit with nonzero exit code if anything fails

npm install

printf "REACT_APP_BACKEND=$BACKEND\nREACT_APP_DEBUG_VERSION=$CF_PAGES_BRANCH@$(echo $CF_PAGES_COMMIT_SHA | head -c7) $(date -u +%F\ %H:%M:%S)" > applications/client/.env.local

printf "NEXT_PUBLIC_BASE_PATH=/conceptual-model-editor\nNEXT_PUBLIC_APP_BACKEND=$BACKEND\nNEXT_PUBLIC_APP_BACKEND_PACKAGE_ROOT=http://dataspecer.com/packages/local-root\nNEXT_PUBLIC_MANAGER_PATH=/manager\nNEXT_PUBLIC_DSCME_LOGO_LINK=/manager" > applications/conceptual-model-editor/.env.local

printf "VITE_BACKEND=$BACKEND\nVITE_CME=/conceptual-model-editor\nVITE_API_SPECIFICATION_APPLICATION=/api-specification" > applications/manager/.env.local

printf "VITE_BACKEND=$BACKEND" > applications/api-specification/.env.local

npx turbo run build --filter=client --filter=conceptual-model-editor --filter=manager --filter=api-specification --filter=genapp

rm -rf .dist

# Copy client application
mkdir .dist
cp -r applications/client/build/* .dist

# Copy conceptual-model-editor application
mkdir .dist/conceptual-model-editor
cp -r applications/conceptual-model-editor/out/* .dist/conceptual-model-editor

# Copy manager application
mkdir .dist/manager
cp -r applications/manager/dist/* .dist/manager

# Copy api-specification application
mkdir .dist/api-specification
cp -r applications/api-specification/dist/* .dist/api-specification

# Copy genapp application
mkdir .dist/genapp
cp -r applications/genapp/dist/* .dist/genapp
