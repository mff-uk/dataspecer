backend
=======

## Installation instructions

1. Clone the whole mono repository. `git clone ...`
2. Optionally create `./env` file that overrides `./.env.defaults` or use environmental variables during the build.
3. Run `npm install` from the root of the repository to install Lerna.
4. Run `lerna bootstrap` to install and link all packages.
5. Run `lerna run build` to build `@model-driven-data/core` and other packages. All generated files are in the `./buid` directory.
6. Start the server by `npm run start` from this directory.

This project uses [Prisma](https://www.prisma.io/).
- To update production database schema, use `npx prisma migrate deploy`.
- To update development database schema, use `npx prisma migrate dev`.
