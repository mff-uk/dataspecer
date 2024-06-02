# Folder structure

We have two levels of folder structure. The root one `/app` and the `/app/diagram`. We won't focus on the first one, there's just the built-in `project-manager` that's useful only for local development, some `utils` shared in the `project-manager` and `diagram`, `components` have only the `dscme` logo here.

More interesting is the folder structure of `/app/diagram`.

## diagram

Root level here are the three most important components:

-   `page` where all of the context providers are initialized, [aggregated concept information is pumped](./dev-docs-working-with-aggregator.md#getting-the-information) to them etc.
-   `visualization` where all the logic regarding drawing stuff to canvas resides
-   and `header` that provides the [exports](./exports.md), [views](./main.md#views) and other management functionality

Then come the folders:

-   `catalog`
    -   every version of catalog is here - [concepts](./concepts-catalog.md), the different versions (class, relationship, ..) and [models](./main.md#model-catalog)
-   `components`
    -   graphical components that are reused throughout the application
    -   if some are related only to certain part of the app, they are placed into folders as well
        -   components for dialogs, input, catalog are in their respective folders
-   `context`
    -   to provide data or functionality on multiple places we use contexts
    -   `class context` provides aggregated and raw information about all the classes, relationships, generalizations and profiles in one place. It also provides functionality for concept manipulation - crud
    -   `model context` provides crud functionality for models, working with aggregator
    -   other contexts are used to stop deduplication and property drilling - `(canvas|dialog) context`
-   `dialog`
    -   each type of dialog has its own file containing the logic needed to execute those operations
-   `features`
    -   we call features functionality that's on top of what a conceptual model editor needs to provide
    -   `autosave`, `color picker`, having all the management functionality in one place `management` and `exports`
-   `reactflow`
    -   types for boxes and edges on the canvas, the logic of drawing names, descriptions, opening context menus
    -   other reused components are in the folder
-   `util` for easier access to names, translations, iris, profiling,
