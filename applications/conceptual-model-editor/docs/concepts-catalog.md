[back to main](./main.md)

# Concept catalog

Here you see and manage the concepts of models you work with.
Concepts are divided into multiple columns based on their types.
You can see these types of columns:

-   classes
-   relationships
-   attributes
-   profiles
-   _and warnings_

## Concepts of a model

So that there is not such a mess with [all classes](#concept-row) (for example) being on a single pile, they are divided into foldable [lists](#model-list-header), each list is related to a model.

### Model list header

In the header of the list, you see:

-   the **alias** of the model, [aliasing a model](./models.md#aliasing-a-model)
-   its **color**, which can be seen in the [color picker](#changing-model-colors)
-   and fold/expand button `🔼`/`🔽` so that your catalog side bar is more organized

#### Changing model colors

There is a color picker. You can make your models easily distinguishable. We tried to choose nice colors. When you add a new model, we choose a color randomly. _Sounds like we could choose the colors to be in good contrast to each other, huh, time crunch._

Just click on the picker and choose a color you like. If you don't want to change the color in the end, just click the color the model already has or click elsewhere.

If you create a new [view](./main.md#views), we copy the colors of the models to the new view as well. If you add a new model afterwards, you'll have to keep the colors synchronized yourself. _We know it is a bit odd, future versions of the editor should work more comfortably._

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
-   create a profile: `🧲` creates a [profile](./profiles.md) of the concept, works with all models. The concept will placed to one of the local models you have opened up (you can decide). And yes, an avocado, felt like it added a novelty factor to our app
