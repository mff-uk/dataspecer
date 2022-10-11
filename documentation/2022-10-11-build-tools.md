# Build tools

As already stated in the [lerna and packages](./2022-02-06-lerna-and-packages.md) documentation, the codebase is a monorepository managed by Lerna. Some packages are simple enough to use the `main` field in `package.json` file. The more complex ones use new `exports` field. To use that package, the consumer package needs at least `"moduleResolution": "Node16"` in its `tsconfig.json` file.
