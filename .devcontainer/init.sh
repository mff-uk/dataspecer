set -xe

printf "REACT_APP_BACKEND=FILL BACKEND URL HERE" > applications/client/.env.local

npm install
npm run build