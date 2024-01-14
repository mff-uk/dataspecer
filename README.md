# Dataspecer ![GitHub last commit](https://img.shields.io/github/last-commit/mff-uk/dataspecer) ![GitHub contributors](https://img.shields.io/github/contributors/mff-uk/dataspecer) [![test](https://github.com/mff-uk/dataspecer/actions/workflows/test.yml/badge.svg)](https://github.com/mff-uk/dataspecer/actions/workflows/test.yml) [![dataspecer.com](https://img.shields.io/badge/-dataspecer.com-informational)](https://dataspecer.com/)

A tool for effortless management of data specifications based on a domain ontology.

## Documentation

See the [general documentation index](./documentation/README.md).

For more information about individual packages, applications, and services, please see the given directory. Each contains a README.md file with build instructions and additional documentation.

- [applications](./applications) - web and cli clients
- [packages](./packages) - core and helper packages and individual generators
- [services](./services) - backend service (used by both web and cli clients)

## Build instructions

This codebase is managed by [npm workspaces](https://docs.npmjs.com/cli/v10/using-npm/workspaces) and [Turborepo](https://turbo.build/repo/docs). Please see the individual packages for their build instructions.

You can check [Cloudflare's build script](cloudflare.build.sh) that deploys the applications.
