[back to main](./main.md)

# Modifications

You can modify an local concept within the limits of what is allowed for its type. You can find out what we offer in the [modification dialog](./dialogs.md#modification-dialog) or see [concepts](./concepts.md#types).

You'll do the modifications in [modification dialog](./dialogs.md#modification-dialog) that can be opened from [catalog row of the concept](./concepts-catalog.md#action-buttons) or from [visualization context menu](./visualization.md#context-menus).

## Input components

### Multi-language text or textarea

In this field you can add multiple translations of the concept's name, description or usage note [for profiles](./concepts.md#class-profile)
It will look something like this. The top row has buttons, the bold one means what language is being edited. The `🗑` button deletes the translation. The `+lang` button adds new translation. You confirm it with `enter` or cancel it by clicking elsewhere.

**`en🗑`** `cs` `de` `+lang`

```
// your description text here
```

This field comes as single line text (for names) and multiline (for descriptions and usage notes).

### IRI input

As we said in [concepts](./concepts.md#types), you can edit the concept's iri. You have the option to use:

-   relative iri
    -   we take the model's base iri and concatenate it with this relative iri
-   absolute
    -   you specify the whole iri including the protocol

There is the iri input for it, looks like so:

`absolute` | **`relative`**

```
https://my.model1.com/entities/   hot-dog-with-cheese
```

The button with bold text means whether you are creating relative or absolute iri.

### Combos

You'll see the usual comboboxes while modifying concepts. The typical use-cases are:

-   changing domain
-   changing range
-   changing datatype
-   making the concept a specialization of some other concept

### Cardinalities

Relationships and attributes (and their profiles) have cardinalities related to their domain (and range). This is a simple radio button group, you select which ever cardinality fits you best.

### Adding specializations

Generalizations/specializations are important part of modeling. You can make a concept a specialization of another concept in the modification dialog as well.

You'll see the `➕ add specialization` button. When you click it, it opens up a pair of a combobox where you select the parent, the concept the modified concept specializes, and the `✅ add` button. After you select the parent concept, don't forget to click the `✅ add` button. It won't work otherwise. You can add multiple parents at once, just repeat the process.

## Changing values in profiles

Profiles inherit values from their parents by default. You should just specialize their values (eg domain cardinality). We allow you to change it to any direction, proceed with caution.

To change the value for a profile, you'll have to check the `[ ] change in profile` checkbox. Once you do that, the value will not be inherited from the profiled concept, instead you'll see your modified value.
