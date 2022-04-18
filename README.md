# About
This codebase is managed by Lerna.
For more information please see individual packages and applications.
- [@dataspecer/core](./packages/core) package
- [schema-generator](./applications/schema-generator) application
- [specification-manager](./applications/specification-manager) application
- [backend](./services/backend) service
- *and other packages under [@dataspecer/*](./packages)*

## How to build 
- Clone the whole repository. `git clone ...`
- Run `npm install` to install Lerna.
- Run `lerna bootstrap` to install all packages.
- *Optional* Run `lerna run test` to run test, to be sure nothing is broken. 
- Run `lerna run build` to build all applications.
- Navigate to package/application of interest and find the generated files in the `build` directory.
