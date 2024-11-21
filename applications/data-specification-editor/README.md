# data-specification-editor application

Application for creating data structures and managing data specifications.

## Building Docker image

1. Optionally create `./.env.local` file that overrides `./.env`.
2. Run `docker build -f client-application.dockerfile -t dataspecer/client .` from the root of this monorepository.
3. Start the application by running `docker run -p 80:80 dataspecer/client`.

## Build instructions

1. Clone the whole mono repository. `git clone ...`
2. Optionally create `./.env.local` file that overrides `./.env` or use environmental variables during the build.
3. Run `npm install` from the **root of the repository** to install all packages.
4. Run `npm run build` from the **root of the repository** to build everything, namely all dependencies of this application. All generated files are in the `./buid` directory.

To specifically build only this application, run `npm run build` from this directory.

Alternatively, you can run the live server by `npm run dev` from this directory. This would require all dependencies to be built before starting the live server.

If you are working on a package or application, run `npm run dev` to continuously build after change. The build of application may fail due to removed files by the build process of the package. Then you need to restart the build job.


---

## React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

### Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```
