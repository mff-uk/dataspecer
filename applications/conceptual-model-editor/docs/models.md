[back to main](./main.md)

# Model catalog

As you might've deduced, here you manage the models.
You have the list of models and some buttons.

## List of models

Each row relates to one model. Models can be added with the [buttons](#buttons) below.

Row starts with an icon. Each model type has a different one.

-   local `🏠`: instance of a local model. You can add concepts here, you can modify its [base IRI](#changing-the-base-iri) and add profiles of concepts from other models.
-   sgov `sgov`: instance of [slovník.gov.cz](https://data.gov.cz/datov%C3%A9-sady)
-   rdfs `📁`: instance of a model from `.ttl` file published somewhere on the web. _Just be warned, we have not yet optimized for large models such as schema.org_

Hovering over the icon shows you the type of the model. With local model, you will also see its [base IRI](#changing-the-base-iri).

Remove the model from workspace by clicking the `🗑` button.

## Model colors

There is a color picker. You can make your models easily distinguishable. We tried to choose nice colors. When you add a new model, we choose a color randomly. _Sounds like we could choose the colors to be in good contrast to each other, huh, time crunch._

In the model item row, you also have an option to choose model's color for current view. Simply open it by clicking the colored square, eg `🟧` and select another color by clicking it, eg `🟩`. If you don't want to change the color in the end, just click the color the model already has or click elsewhere.

If you create a new [view](./main.md#views), we copy the colors of the models to the new view as well. If you add a new model afterwards, you'll have to keep the colors synchronized yourself. _We know it is a bit odd, future versions of the editor should work more comfortably._

### Aliasing a model

We reference models with `id`s. We understand it is not the best fit for you, so you can alias the models by clicking the `✏` button on the right side of model row.

Simply type in the alias and hit `enter` or click elsewhere. If you don't want to use the new alias, hit `esc` and the alias will remain unchanged.

### Changing the base IRI

It is beneficial to have a base IRI set for your models/vocabularies. With local models, you can set their `base IRI` by clicking the `📑` button right next to the model icon.

It works the same way as model aliasing. Type in something, confirm it with `enter` or click elsewhere, cancel it with `esc`.

## Buttons

The bottom part has 3 buttons, one to add any `.ttl` model, one for `local` model and a shortcut for [slovník.gov.cz](https://data.gov.cz/datov%C3%A9-sady).

## Adding a model

When you click the `+model` button, a [dialog](./dialogs.md#add-model-dialog) opens up. Here you paste the urls of your models you want to use. You can add multiple models at once but be aware that they get interpreted as if it was a single model.

### Local model

By clicking `+local` you add a new local model to your workspace. You can change its [alias](#aliasing-a-model) or its [base IRI](#changing-the-base-iri).
