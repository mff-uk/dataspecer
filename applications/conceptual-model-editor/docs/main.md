# dscme

_developer docs are [here](./dev-docs.md)_

**Dataspecer - Conceptual model editor**

You can do many things in here.

-   explore `.ttl` models and [`sgov.cz`](https://data.gov.cz/datov%C3%A9-sady)
-   create your own models
-   create application profiles of modeled entities
-   create diagrams
-   and.. that seems it

## Workflow

You can head straight to the editor on [this url](https://tool.dataspecer.com/conceptual-model-editor/core-v2). There you can do quite a lot of things. However, if you want to have your work persisted, refer yourself to [persistence section](./persistence.md).

### Start with the manager

Best way to start is to use the [specification manager](https://tool.dataspecer.com/manager). All Dataspecer related items are available there. If you want to user Dataspecer backend to work with `dscme`, that's where you should start.

## Application layout

`dscme` is very (**very**) simple app. You have your:

-   **header** up top
-   **catalog** that's divided into two parts on your left
-   and **visualization** on your right

### Catalog

Catalog has two parts, one for models and one for concepts (classes/relationships/attributes/profiles).

#### Model catalog

Here are all models you work with.
First you see the list of models, some icons, buttons etc.
The bottom part has 3 buttons, one to add any `.ttl` model, one for `local` model and a shortcut for [slovník.gov.cz](https://data.gov.cz/datov%C3%A9-sady).

For more information on working with models, refer yourself to [models section](./models.md).

#### Concept catalog

Here are all concepts from models you work with. They are divided into multiple columns based on their type.
Concepts from different models are treated differently, concepts based on their type are treated differently.

For more information on working with concepts, refer yourself to [concepts section](./concepts-catalog.md).

### Header

Contains your [persistence](./persistence.md) and [export](./exports.md) management. You also choose your `view` on the data, we mean the diagrams on the canvas.

#### Views

You always see the current `view id`. If you want to add another `view`/`diagram`, you can just click the `+🖼` button. That creates a new view, sets the same colors to your models as with the last view.

Clicking the `🗃️` button, you open view catalog where you can change your current view to another one. If you are not satisfied with a view you created, you can simply delete it by clicking the `🗑` icon next to the `view` in the catalog.

#### Preferred language

You can also choose the language of your preference. With a language selected, we try to show the details, names and descriptions in dialogs and on the canvas in that language first. _We plan to come up with a more robust hierarchy of languages in the future. It will help with the language management._
