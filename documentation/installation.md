# Installation instructions

## Dependencies
- Node@16 (Node@17 is not yet supported due to a bug in third party library)

## Optional dependencies
- [Install Bikeshed](https://tabatkins.github.io/bikeshed/#install-pyenv) to be accessible from the command line. Use `pip3` for example.

## Backend
1. `git clone https://github.com/sstenchlak/specification-manager-backend`
2. `cd specification-manager-backend`
3. `npm install`
4. `npx prisma migrate dev` - to initialize the database
5. `npm run build`
6. `echo PORT=4000 > .env` - to set the port for the server
7. `npm run start` - to start the server

You need to make the backend accessible from the Internet. The rest of the instructions except the server's address to be `http://localhost:4000`.

## Frontend
1. `git clone https://github.com/opendata-mvcr/model-driven-data`
2. `cd model-driven-data`
3. `npm install`
4. `npx lerna bootstrap`
5. `echo REACT_APP_BACKEND=http://localhost:4000 > applications/specification-manager/.env` - to set the backend URL
6. `echo REACT_APP_SCHEMA_GENERATOR=http://localhost:3000/ >> applications/specification-manager/.env` - to set the URL of the Schema generator (see below)
7. `npx lerna run build`

Publish `applications/specification-manager/build` and `applications/schema-generator/build` in your web server. Redirect everything to the corresponding index.html file (both applications are single-page apps).
