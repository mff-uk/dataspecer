editor
======

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Installation instructions

1. Clone the whole mono repository. `git clone ...`
2. Optionally create `./env.local` file that overrides `./.env` or use environmental variables during the build.
3. Run `npm install` from the root of the repository to install Lerna.
4. Run `lerna bootstrap` to install and link all packages.
5. Run `lerna run build` to build `@dataspecer/core` and other packages and the editor. All generated files are in the `./buid` directory.

Alternatively, you can run the live server by `npm run build:watch` from the editor directory. This would require all dependencies to be built, either by Lerna itself, or directly through npm in each package it depends on.

If you are working on a package, run `build:watch` both in the package directory and editor directory. The build of application may fail due to removed files by the build process of the package. Then you need to restart the build job.
