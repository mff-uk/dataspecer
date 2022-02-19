# About
This codebase is managed by Lerna.
For more information please see individual packages and applications.
- [@model-driven-data/core](./packages/core) package
- [schema-generator](./applications/schema-generator) application
- [specification-manager](./applications/specification-manager) application

## How to build 
- Clone the whole repository. `git clone ...`
- Run `npm install` to install Lerna.
- Run `lerna bootstrap` to install all packages.
- *Optional* Run `lerna run test` to run test, to be sure nothing is broken. 
- Run `lerna run build` to build all applications.
- Navigate to package/application of interest and find the generated files in the `build` directory.

***

Tento repozitář je udržován v rámci projektu OPZ č. CZ.03.4.74/0.0/0.0/15_025/0013983.
![Evropská unie - Evropský sociální fond - Operační program Zaměstnanost](https://data.gov.cz/images/ozp_logo_cz.jpg)
