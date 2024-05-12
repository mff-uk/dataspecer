[back to main](./main.md)

# conceptual-model-editor

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

Apart from the explicit use of several npm `@dataspecer/*` libraries currently linked via npm workspaces, this project is not dependent on the rest of the codebase.

This project uses:

-   Next.js 13 with [static HTML export enabled](https://nextjs.org/docs/advanced-features/static-html-export) and experimental app directory
-   React.js 18
-   Tailwind.css
-   JointJS

# Build instructions

1. Clone the repository
2. From the root of the mono repository install all packages

```
npm install
```

3. Build dependent @dataspecer packages and this project by executing following command from the root of this repository

```
npm run build
```

or to explicitly build only dependent packages, use

```
npx turbo run build --scope=conceptual-model-editor
```

Then, you can start dev server from this directory by

```
npm run dev
```
