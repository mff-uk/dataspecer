# Dataspecer ![GitHub last commit](https://img.shields.io/github/last-commit/mff-uk/dataspecer) ![GitHub contributors](https://img.shields.io/github/contributors/mff-uk/dataspecer) [![test](https://github.com/mff-uk/dataspecer/actions/workflows/test.yml/badge.svg)](https://github.com/mff-uk/dataspecer/actions/workflows/test.yml) [![dataspecer.com](https://img.shields.io/badge/-dataspecer.com-informational)](https://dataspecer.com/)

A tool for effortless management of data specifications based on a domain ontology.

## Documentation

See the [documentation index](./documentation/README.md).

For more information about individual packages, applications, and services, please see the given directory. Each contains a README.md file with build instructions and additional documentation.

- [@dataspecer/backend-utils](./packages/backend-utils) package


- [@dataspecer/core](./packages/core) package
- [@dataspecer/sgov-adapter](./packages/sgov-adapter) package


- [@dataspecer/federated-observable-store](./packages/federated-observable-store) package
- [@dataspecer/federated-observable-store-react](./packages/federated-observable-store-react) package

<!-- -->

- [client](./applications/client) application (specification manager and schema editor)
- [cli](./applications/cli) application

<!-- -->

- [backend](./services/backend) service

## Build instructions

This codebase is managed by [Lerna](https://github.com/lerna/lerna). Please see the individual packages for their build instructions.

You can check [Cloudflare's build script](cloudflare.build.sh) that deploys the applications.
