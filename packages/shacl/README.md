# SHACL

## How to install

Minimal installation requires only the SHACL package and all its dependencies.

1. Clone the repository `git clone ...`
2. Install Lerna by `npm install` from the root of the repository
3. Bootstrap packages (install dependencies and link them) by `npx lerna bootstrap` optionally with `--scope @dataspecer/shacl --include-dependencies` to skip other packages
4. Build all packages (this is necessary to build dependencies) by `npx lerna run build` optionally with `--scope @dataspecer/shacl --include-dependencies` to skip other packages

Then, you can:
- Run tests by `npm run test` from the package directory
- Build the package by `npm run build` from the package directory

---

To use this package with a client application, you need to bootstrap and also build client application's packages. Either use lerna commands without the scope modifier or add another scope `--scope application`.

To start development mode, where everything updates automatically, run `npm run build:watch` from this package's directory and `npm run build:watch` from `/applications/client` directory as well.