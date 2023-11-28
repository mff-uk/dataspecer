# @dataspecer/json-example

## How to install

Minimal installation requires only the SHACL package and all its dependencies.

1. Clone the repository `git clone ...`
2. Install Lerna by `npm install` from the root of the repository
3. Bootstrap packages (install dependencies and link them) by `npx lerna bootstrap` optionally with `--scope @dataspecer/json-example --include-dependencies` to skip other packages
4. Build all packages (this is necessary to build dependencies) by `npx lerna run build` optionally with `--scope @dataspecer/json-example --include-dependencies` to skip other packages

