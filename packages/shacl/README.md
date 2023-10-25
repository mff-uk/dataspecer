# SHACL

## How to install

Minimal installation requires only the SHACL package and all its dependencies.

1. Clone the repository `git clone ...`
2. Install Lerna by `npm install` from the root of the repository
3. Bootstrap packages (install dependencies and link them) by `npx lerna bootstrap` optionally with `--scope @dataspecer/shacl --include-dependencies` to skip other packages
4. Build all packages (this is necessary to build dependencies) by `npx lerna run build` optionally with `--scope @dataspecer/shacl --include-dependencies` to skip other packages

## To reproduce the issue:
- Run tests by `npm run test` from the package directory

- The issue is in generating jsonSchema in schacl-adapter.spec.ts in class jsonSchemaCreator
- The question is - are CONTEXT and SPECIFICATION initialized properly?
-     Regarding this line of code: await jsonGenerator.generateToStream(context, jsonSchema, specification, streamDictionary);
- The context and specification are being initialized before this line in the file, maybe something is missing in them or maybe something in them is badly initialized.
