# backend service

The backend service is a Node.js server and a part of the Dataspecer application that manages data specifications and provides access to stores. It also provides an API to compile the Bikeshed source.

## Documentation

See the [project structure](documentation/2022-04-21-project-structure.md) or look directly into the code.

## Installation instructions

1. Clone the whole mono repository. `git clone ...`
2. Create copy of `./main.config.sample.js` as `./main.config.js` and modify the configuration.
3. Run `npm install` from the root of the repository to install Lerna.
4. Run `npx lerna bootstrap` to install and link all packages.
5. Run `npx lerna run build` to build `@dataspecer/core` and other packages. All generated files are in the `./build` directory.
6. Run `npx lerna run update-database` to create empty database or update the current one if the schema changes.
7. Start the server by `npm run start` from this directory. To keep the server running permanently, use `tmux`, for example.

This project uses [Prisma](https://www.prisma.io/) and SQLite database. After updating the package, you need to migrate the database file if the [schema](prisma/schema.prisma) changes.
- To create the migration after a schema update, use `npx prisma migrate dev --name ...`
- To update development database schema, use `npx prisma migrate dev`.

All data are stored in the `database` directory.

### Optional dependencies
- [Install Bikeshed](https://tabatkins.github.io/bikeshed/#install-pyenv) to be accessible from the command line. Use `pip3`, for example. If the Bikeshed is not installed, the generation will fail, but it does not break the whole process.

### Using as a bundle

You can use `npm run build-pack` to create a single bundle file. To make things work, keep the following files:
- `./node_modules/.prisma/` - contains necessary binaries
- `./database/` - your database directory
- `./dist/backend-bundle.js` - this is the file that you need to execute
- `./prisma/schema.prisma`

```shell
zip -r backend.zip ./node_modules/.prisma/ ./dist/backend-bundle.js ./prisma/schema.prisma
```
