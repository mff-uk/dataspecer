# client application (specification manager and schema editor)

Manager or Schema manager is a web application where you can create new data specifications and data schemas and generate artifacts. The manager then redirects the user to the editor to edit the schema.

The manager communicates with the [backend](../../services/backend) service.

The editor is a web application where you can modify individual data schemas. The main part of the application is the schema visualized as a tree. You can add entities, search for them, modify them, link other schemas etc.

The editor itself (URL is `/editor`) can be used as a stand-alone app only for testing purposes. It needs context provided by the manager application to make the changes persistent.

## Documentation

See the [project structure](documentation/2022-04-21-project-structure.md), individual directories for README.md files, or documentation directly in the code.

---

## Building Docker image

1. Optionally create `./.env.local` file that overrides `./.env`.
2. Run `docker build -f client-application.dockerfile -t dataspecer/client .` from the root of this monorepository.
3. Start the application by running `docker run -p 80:80 dataspecer/client`.

## Build instructions

1. Clone the whole mono repository. `git clone ...`
2. Optionally create `./.env.local` file that overrides `./.env` or use environmental variables during the build.
3. Run `npm install` from the **root of the repository** to install all packages.
4. Run `npm run build` from the **root of the repository** to build everything, namely all dependencies of this application. All generated files are in the `./buid` directory.

To specifically build only this application, run `npm run build` from this directory. 

Alternatively, you can run the live server by `npm run dev` from this directory. This would require all dependencies to be built before starting the live server.

If you are working on a package or application, run `npm run dev` to continuously build after change. The build of application may fail due to removed files by the build process of the package. Then you need to restart the build job.
