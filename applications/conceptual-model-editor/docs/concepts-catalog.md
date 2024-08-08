[back to main](./main.md)

# Concept catalog

Here you see and manage the concepts of models you work with.
Concepts are divided into multiple columns based on their types.
You can see these types of columns:

-   classes
-   relationships
-   attributes
-   profiles
-   _and warnings (we hope you don't see them at all)_

## Concepts of a model

So that there is not such a mess with [all classes](#concept-row) (for example) being on a single pile, they are divided into foldable [lists](#model-list-header), each list is related to a model.

### Model list header

In the header of the list, you see:

-   the **alias** of the model, [aliasing a model](./models.md#aliasing-a-model)
-   and fold/expand button `🔼`/`🔽` so that your catalog side bar is more organized

### Concept row

A concept row consists of multiple parts: link to concept website, concept name and action buttons.

#### Name

We try to show you the concepts with their names in the [preferred language](./main.md#preferred-language). If that doesn't work, we'll show you a different translation. If there is no name at all, we try to show `IRI` and as a last resort, we show the internal concept `id`.

#### Link to concepts IRI

On the left side of the concept row, there is the `📑`. When you click that, we'll redirect you to the location the IRI points to. Don't worry, it'll open up a different tab, your work is safe 😉.

#### Action buttons

-   detail: `ℹ` opens the [detail dialog](./dialogs.md#detail-dialog)
-   place to canvas: `👁`/`🕶` places/removes the concept to/from the canvas. You can also use the drag&drop feature for classes and class profiles
-   modify: `✏` opens the [modification dialog](./dialogs.md#modification-dialog), works only with concepts from [local models](./models.md#list-of-models)
-   remove: `🗑` removes the concept from the model, works only with concepts from [local models](./models.md#list-of-models)
-   expand: `expand` loads/removes the surroundings of the concept, works only with concepts from [sgov](./models.md#list-of-models)
-   create a profile: `🧲` creates a [profile](./profiles.md) of the concept, works with all models. The concept will placed to one of the local models you have opened up (you can decide). And yes, a magnet, felt like it added a novelty factor to our app.

### Creating a new class

You can also create new classes in the concepts catalog. It is possible only for [local models](./models.md#local-model) though. This opens up the [create class dialog](./dialogs.md#create-class-dialog), you provide all necessary information about the class and it gets created.
