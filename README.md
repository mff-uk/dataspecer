# Dataspecer ![GitHub last commit](https://img.shields.io/github/last-commit/mff-uk/dataspecer) ![GitHub contributors](https://img.shields.io/github/contributors/mff-uk/dataspecer) [![test](https://github.com/mff-uk/dataspecer/actions/workflows/test.yml/badge.svg)](https://github.com/mff-uk/dataspecer/actions/workflows/test.yml) [![dataspecer.com](https://img.shields.io/badge/-dataspecer.com-informational)](https://dataspecer.com/)

A set of tools for effortless management and creation of data specifications.

## Documentation

Check [what to learn](./documentation/what-to-learn.md) - a simple guide on how to start working on the project.

## Build instructions

This repository is a monorepo - consisting of several packages, applications, and services that are build and developed separately, but depends on each other.

For more information about individual packages, applications, and services, please see the given directory. Each contains a README.md file with build instructions and additional documentation.

- [applications](./applications) - web and cli clients
- [packages](./packages) - core and helper packages and individual generators
- [services](./services) - backend service (used by both web and cli clients)

The monorepo is managed by [npm workspaces](https://docs.npmjs.com/cli/v10/using-npm/workspaces) and [Turborepo](https://turbo.build/repo/docs). Please see the individual packages for their build instructions.

You can check the [Cloudflare's build script](./cloudflare.build.sh) that deploys all applications. We use [Cloudflare Pages](https://pages.cloudflare.com/) for that. Any commit pushed to GitHub into the repository is automatically built, and changes are deployed to the internet. Commits to other branches are also deployed as previews.

### In general

Your `node -v` should be at least `v18.19.0`, but `v20` is recommended.

After cloning the repository you should create local config files. Please see individual applications or packages what to do.

Then
- Run `npm install` to install all external packages (including TypeScript for typechecking and Turborepo for building) and link all dependencies between local packages.
- Run `npm run build` to build everything. This will execute `turbo build` under the hood. This will build packages, which are necessary for the development of other packages and applications; and it also build applications themselves, which is not necessary for development (see the next step). (If you want to build only packages necessary for a specific package or application, use `npx turbo run build --filter=<package-name>`. Obtain the name of the package from `package.json` file.)

To develop a concrete package or application, there is *usually* an `npm run dev` script that will run live server, which updates everything. See individual packages for more details.