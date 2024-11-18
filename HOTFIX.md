There was an issue with the `ajv` and `ajv-keywords` libraries, which were installed with incompatible versions, causing errors such as "Cannot find module 'ajv/dist/compile/codegen'". To resolve this, you need to ensure they are installed in compatible versions. The solution that worked was to install and force the latest versions in the root package.json file.

