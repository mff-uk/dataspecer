# client application (specification manager and schema editor)

Manager or Schema manager is a web application where you can create new data specifications and data schemas and generate artifacts. The manager then redirects the user to the editor to edit the schema.

The manager communicates with the [backend](../../services/backend) service.

The editor is a web application where you can modify individual data schemas. The main part of the application is the schema visualized as a tree. You can add entities, search for them, modify them, link other schemas etc.

The editor itself (URL is `/editor`) can be used as a stand-alone app only for testing purposes. It needs context provided by the manager application to make the changes persistent.

## Documentation

See the [project structure](documentation/2022-04-21-project-structure.md), individual directories for README.md files, or documentation directly in the code.

---

## Build instructions

1. Clone the whole mono repository. `git clone ...`
2. Optionally create `./env.local` file that overrides `./.env` or use environmental variables during the build.
3. Run `npm install` from the **root of the repository** to install Lerna.
4. Run `lerna bootstrap` to install and link all packages.
5. Run `lerna run build` to build `@dataspecer/core` and other packages and the editor. All generated files are in the `./buid` directory.

Alternatively, you can run the live server by `npm run build:watch` from this directory. This would require all dependencies to be built, either by Lerna itself, or directly through npm in each package it depends on.

If you are working on a package or application, run `build:watch` to continuously build after change. The build of application may fail due to removed files by the build process of the package. Then you need to restart the build job.
