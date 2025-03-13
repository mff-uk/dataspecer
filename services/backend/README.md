# backend service

The backend service is a Node.js server and a part of the Dataspecer application that manages data specifications and provides access to stores.

## Installation instructions

1. Clone the whole mono repository. `git clone ...`
2. Create copy of `./main.config.sample.js` as `./main.config.js` and modify the configuration.
3. Run `npm install` from the root of the repository to install and link all packages.
5. Run `npm run build` from root of the repository to build `@dataspecer/core` and other packages. All generated files are in the `./build` directory.
6. Run `npm run update-database` from this directory to create empty database or update the current one if the schema changes.
7. Start the server by `npm run start` from this directory. To keep the server running permanently, use `tmux`, for example.

This project uses [Prisma](https://www.prisma.io/) and SQLite database. After updating the package, you need to migrate the database file if the [schema](prisma/schema.prisma) changes.
- To create the migration after a schema update, use `npx prisma migrate dev --name ...`
- To update development database schema, use `npx prisma migrate dev`.

All data are stored in the `database` directory.
