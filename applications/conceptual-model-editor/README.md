# DataSpecer: Conceptual-Model-Editor
Conceptual-Model-Editor (CME) is designed to allow user to create conceptual models.
You can try the [editor online](https://tool.dataspecer.com/conceptual-model-editor/diagram).

# Installation
CME is installed and deployed as a part of the DataSpecer.
However you need to provide CME with configuration.
You can do this using the `.env` file.
Just copy `./env.example` as `.env` and update the configuration to your liking.

# Development
We use eslint to keep the code in shape.
Please run `npm run lint` and `npm run test` before every commit if possible.

You can start a local development using `npm run dev`.
As Vite is using caching of sources, changes in the imported packages from this repository may propagate.
To address this you need to force Vite to rebuild cache using `npx vite --force`.
Keep in mind that this command takes a little bit more time.

### CME

We will shortly describe the architecture of the CME in general.
It makes no sense to describe, in what places each feature is implemented,
since it isn't that important and if anyone starts to work on the project,
they should be relatively quickly able to tell, where is roughly what based on the given overview here.

## More robust guide for development, which is more beginner friendly than the other "official" guides in github repository. But it may get deprecated over time.

- When you just want to test diagram without using packages, then there is nothing extra you need to do.
  - Run `npm install` from root directory
  - Run `npm run build` from root directory
  - Run `npm run dev` from the applications/conceptual-model-editor directory

- Running manager - sometimes you want to access packages and not only run the diagram part:
  - In the applications/conceptual-model-editor directory create .env file from .env.example
    - When you want to use the official Dataspecer backend:
      - VITE_PUBLIC_APP_BACKEND="https://tool.dataspecer.com/api"
      - When you also want to run the manager and connect it to locally running CME, create .env.local from .env and set the backend to
        - VITE_BACKEND=https://tool.dataspecer.com/api
        - And run the manager using `npm run dev` from the applications/manager
    - When you want to run backend locally set the backend variables mentioned above to http://localhost:3100
and run the backend as described [here](https://github.com/mff-uk/dataspecer/tree/main/services/backend) (that being said I am no longer able to run the backend, so not sure if it still works, might be related to the https://github.com/mff-uk/dataspecer/issues/1145)

# Known issues
We put all dependencies in package.json into "dependencies".
When using "devDependencies" as we should, there is issue with rollup and npm.
