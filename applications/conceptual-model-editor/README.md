# conceptual-model-editor

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

Apart from the explicit use of several npm `@dataspecer/*` libraries currently linked via Lerna, this project is not dependent on the rest of the codebase.

This project uses:

-   Next.js 13 with [static HTML export enabled](https://nextjs.org/docs/advanced-features/static-html-export) and experimental app directory
-   React.js 18
-   Tailwind.css
-   JointJS

# Build instructions

1. Clone the repository
2. From the root of the mono repository install root packages

```
npm install
```

3. Bootstrap (install dependencies and link packages) `npx lerna bootstrap` `--scope conceptual-model-editor --include-dependencies`

```
npx lerna bootstrap
```

or optionally with following flags to ignore other packages

```
npx lerna bootstrap --scope conceptual-model-editor --include-dependencies
```

4. Build dependent @dataspecer packages and this project by

```
npx lerna run build
```

or optionally with following flags to ignore other packages

```
npx lerna run build --scope conceptual-model-editor --include-dependencies
```

Then, you can start dev server from this directory by

```
npm run dev
```

Note: `npm install` from this directory will not work because of the local packages. Use `npx lerna bootstrap` and `npx lerna add <package> --scope conceptual-model-editor` from the root directory instead.
