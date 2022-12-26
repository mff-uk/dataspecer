set -xe

printf "REACT_APP_BACKEND=FILL BACKEND URL HERE" > applications/client/.env.local

npm install
npx lerna bootstrap --scope client --include-dependencies
npx lerna run build --scope client --include-dependencies