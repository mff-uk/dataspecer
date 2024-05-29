[back to main](./main.md)

# Dialogs

Another way to interact with concepts than [visualization](./visualization.md) is to use dialogs. There are different versions of dialogs based on what they do.

You can open them either by clicking action buttons in [model catalog](models.md#buttons), [concept catalog](concepts-catalog.md#action-buttons) or in the [context menus](./visualization.md#context-menus) in visualization.

Dialogs are mostly divided into three parts.

1. header with base information

-   source model of a concept, its color
-   language selection
-   concept name

2. additional fields

-   (input) fields for modification

3. and action buttons

-   confirm
-   add
-   cancel

## Detail Dialog

Show concept's detailed information.

This dialog can be opened from [concept catalog](./concepts-catalog.md#action-buttons) or from [visualization context menu](./visualization.md#context-menus) by clicking `ℹ` / `ℹ open detail` button.

Header contains the most important information - name, source model, iri, link to open up the concept in its location `📑`, its generalizations (parents) and specializations (children).

Mid-part shows concept's type, description, attributes (for classes and class profiles), domain and range (for relationships and attributes).

### Click-through-s

In the detail dialog, generalizations/specializations, attributes or domain/range are clickable elements, they look like `🟧 My class 2`. When you click on it, it will show you the detail of the concept.

## Modification Dialog

This dialog can be opened from [concept catalog](./concepts-catalog.md#action-buttons) or from [visualization context menu](./visualization.md#context-menus) by clicking `✏` / `✏ modify` button.

To modify a concept, you will have to use the modification dialog. See chapter [modifications](./modifications.md) for more detail how to use all the fields of the dialog.

## Profile Dialog

This dialog can be opened from [concept catalog](./concepts-catalog.md#action-buttons) or from [visualization context menu](./visualization.md#context-menus) by clicking `🧲` / `🧲 create profile` button.

To create a profile of a concept, you will have to use the profile dialog. See chapter [profiles](./profiles.md) for more detail how to use all the fields of the dialog.

## Create Class Dialog

You can open this dialog a with a button from local model section in [concept catalog](./concepts-catalog.md#creating-a-new-class) or by `alt`+clicking on the canvas.

You can choose to which model you'll create the class in the dialog's header. Edit the class' name and description. If you don't know how, refer yourself to [modification](./modifications.md#multi-language-text-or-textarea) where it gets explained.

## Create Connection Dialog

You can open this dialog by dragging a new edge from your desired target class / class profile to the target class / class profile as mentioned in [visualization](./visualization.md#creating-relationships).

You can choose to which model you'll create the class in the dialog's header. Edit the relationship's name, description, iri and cardinalities, if you choose to create a relationship. If you want to create a generalization, you'll just have to put in the iri.

Change from relationship to generalization (or otherwise) by clicking the button that is not highlighted, eg **`relationship`** | `generalization`.

## Add Model Dialog

You paste the urls of your models you want to use to the textarea of the dialog. You can add multiple models at once but be aware that they get interpreted as if it was a single model. Confirm adding the model by clicking `✅add` or cancel by clicking `❌cancel` button.
