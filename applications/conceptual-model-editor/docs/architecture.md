[back to main](./main.md)

# dscme architecture

If you need an explanation why to use `dscme`, read the [motivation](./dev-docs.md#motivation).

context model:

![context model](./img/dscme-c4-context-2.svg)

container model:

![container model](./img/dscme-c4-container.svg)

component model:

![component model](./img/dscme-c4-component.svg)

The diagram might be a little complex to read, we'll try to help with this description.

## 1. Having a place to store your modeled concepts

The editor works with two types of entities - [models](./models.md) and [concepts](./concepts.md). Concept models contain (as you expect) concepts, visual models contain information about concepts for [visualization](./visualization.md), more about [visual models later](#4-displaying-concepts-on-canvas).

Models can be [local](./models.md#local-model) (created by the modeler using `dscme`) or external (from somewhere on the web). Local models are added to the workspace in [models catalog](./models.md#local-model).

The external ones are loaded through the [add model dialog](./models.md#adding-a-model), implementation is in [dialogs folder](./dev-docs-folder-structure.md#folder-structure).

All models you are working with are accessible in every child component of the React app with [`useModelGraphContext` hook](./dev-docs-folder-structure.md) (context folder). You add, remove, modify the models through this hook as well, eg. [setting an alias](./models.md#aliasing-a-model) or [setting a base iri](./models.md#changing-the-base-iri).

## 2. Creating and/or reusing existing concepts

To be able to access concepts in local or external models, the models need to be registered to the [aggregator](./dev-docs-working-with-aggregator.md). It, as the name suggests, aggregates information about concepts. The information is then used in [`useClassesContext` hook](./dev-docs-folder-structure.md) (context folder) that provides all concept types for you to work with them. Adding, modifying, removing classes is done from this hook.

## 3. Displaying concepts in catalog

All existing concepts are displayed in the [concepts catalog](./concepts-catalog.md), in ([catalog folder](./dev-docs-folder-structure.md#diagram)). Based on the concept type, different catalog is shown. Concepts are grouped by their source models. You know what models are available from the `useModelGraphContext` hook and the concepts are then filtered from the `useClassesContext`.

## 4. Displaying concepts on canvas

What concepts can be seen on canvas is determined by the `active visual model` that is currently registered in the `aggregator`. [Visual models](./main.md#views) are also available through the `useModelGraphContext` hook. View manipulation is either done on-load, `useEffect` in main `page.tsx` or in [view management](./dev-docs-folder-structure.md#diagram) (folder `features/management`).

[Visualization](./visualization.md) is subscribed to the `aggregator` as well. If there is a semantic change (a concept has changed), the state on canvas is updated based on information from aggregator.

Rendering is done with [React Flow](./about-and-install.md#3rd-party-libraries).

## 5. Interaction is done within dialogs

Application logic for [creation](./concepts.md#creating-a-concept), [modification](./modifications.md), [profiling](./profiles.md) is located in their respective [dialogs](./dialogs.md), found in [`/dialogs` folder](./dev-docs-folder-structure.md#diagram).

## 6. Persistence and generated artifacts

Once the user is done with the modeling, model workspace can be [saved to Dataspecer backend](./persistence.md#making-your-work-persistent). That is done within package management (in folder `/features/management`).

Export management (in folder [`/features/management`](./dev-docs-folder-structure.md#diagram)) does the persistence. It is also responsible for [generating `light-weight ontology`](./persistence.md#lightweight-ontology) that user can then publish.
