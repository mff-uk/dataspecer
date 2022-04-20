# Model driven data

## Documentation

General documentation can be found in [the documentation directory](./documentation), containing design decisions and project structure. For more information about individual packages, applications, and services, please see the given directory.
- [@dataspecer/backend-utils](./packages/backend-utils) package
- [@dataspecer/core](./packages/core) package
- [@dataspecer/federated-observable-store](./packages/federated-observable-store) package
- [@dataspecer/federated-observable-store-react](./packages/federated-observable-store-react) package

<!-- -->

- [editor](./applications/editor) application
- [manager](./applications/manager) application

<!-- -->

- [backend](./services/backend) service

## Build instructions

This codebase is managed by [Lerna](https://github.com/lerna/lerna).

Please see the individual packages for their build instructions. To be able to work on the project, you need to bootstrap packages and build all dependencies.

You can check [Cloudflare's build script](cloudflare.build.sh) that deploys the applications.

- Clone the whole repository. `git clone ...`
- Run `npm install` to install Lerna.
- Run `npx lerna bootstrap` to install and link all packages.
- *Optionally* run `npx lerna run test` to run test, to be sure nothing is broken. 
- Run `lerna run build` to build everything.

Tento repozitář je udržován v rámci projektu OPZ č. CZ.03.4.74/0.0/0.0/15_025/0013983.
![Evropská unie - Evropský sociální fond - Operační program Zaměstnanost](https://data.gov.cz/images/ozp_logo_cz.jpg)
