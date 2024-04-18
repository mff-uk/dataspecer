# What to learn

_This file briefly summarizes technologies that are required to be able to contribute to this project. You can consider this file as brief instructions on the technologies used. Feel free to update the file if you think some significant knowledge is missing._

---

All source codes are in [Typescript](https://typescriptlang.org/). It is a programming language that builds on JavaScript by adding types and type safety. You need to understand JavaScript first. Look at [javascript.info](https://javascript.info/), for example.

The project is split into the packages (see [README.md](../README.md)). Each package is managed by [npm](https://www.npmjs.com/) package manager. Npm introduces the `package.json` file, that contains all the dependencies that the package uses. You can check them in advance, but it is sufficient to search the package once you find it is used in the code you are interested in.

The packages are built either with the Typescript compiler or some bundler like [Vite](https://vitejs.dev/) or [Webpack](https://webpack.js.org/). Webpack and Vite use the Typescript compiler, but bundle all the files with images, CSS and other assets into fewer files. All compilers require configuration files that are located in the package root, and it is not necessary to understand them immediately, as well as the whole build process. Usually, `npm run build` builds the package, and `npm run dev` runs either the live server (in case of applications) or automatically rebuilds the package if the source changes.

Packages depend on each other. The dependency is managed by [npm workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces). Simply said, npm is aware that some packages are not in the npm registry but in a different directory.

_By this point, you should be able to contribute to the project and compile it by yourself._

Each package is a little different. Always read its README.md file first. We use ESLint to keep an eye on our code style. See [Code style](2022-02-06-code-style.md) for more information.

Applications use [React](https://reactjs.org/), a library for building user interfaces. React is similar to [Vue.js](https://vuejs.org/) or [Angular](https://angular.io/). React uses components to build the user interface. Each component has something like HTML that is rendered. If the data the component uses changes, React automatically re-renders the HTML.
