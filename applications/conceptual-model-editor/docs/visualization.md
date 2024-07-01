[back to main](./main.md)

# Visualization

Here and in [dialogs](./dialogs.md) are the places where you'll spend most of your time.

In the visualization, you can:

-   interact with your classes, relationships and profiles
-   place them differently
-   create relations between your classes
-   have the concepts shown or hidden
-   ...etc

## Placing a class on canvas

You can create a class either in the [concepts catalog](./concepts-catalog.md#creating-a-new-class) or in the visualization. To do it here, you need to hold the `alt` key and click on the canvas. It opens up the [create class dialog](./dialogs.md#create-class-dialog) and places the class to the position you just clicked.

If you want to place already existing class or class profile to canvas, you can either click the `🕶/👁` button in the [concept item row](./concepts-catalog.md#concept-row) or you can drag-n-drop it to your desired position on the canvas. The `🕶/👁` button shows the concept either:

-   on the position where it was before it was hidden
-   or if no such position exists, it places it randomly.

For that reason, we suggest to drag-n-drop it.

### Class node visuals

Class or a class profile have the visuals of a box with the [source model color](./models.md#model-colors) in the header. Class profile also has a `profile of XYZ` there.

#### Class box handles

You have 4 handles on the class box:

-   **top and bottom** sides have source handles, relationships start here.
-   **left and right** sides have the target handles, relationships end here.

## Relationships

Existing models already have relationships between classes or class profiles. By default, when you place a `class A` on canvas and if any other `class B` that has some `relation R` to `class A`, `R` is shown on the canvas. Relationships start in [`s` handles and end in `t` handles](#class-box-handles), which of the two handles is chosen is based on which is closer for the 2 classes.

### Creating relationships

You create a relationship between two classes (class profiles) by dragging new edge from `s` handle of the source class (domain) to the `t` handle of the target class (range). You can end the drag once the edge end snaps to the `t` handle.

This opens up the [create connection dialog](./dialogs.md#create-connection-dialog). You provide all necessary information and create the relationship.

## Context menus

You can open a context menu for classes, relationships, their profiles, and generalizations. You do it not by your standard way (eg. right-click) but by double-clicking the concept. It opens up the [context menu](#context-menu-options). _If you wonder why not the standard context menus, long story short, the developer didn't know about it 🙃. For more of the planned enhancements, refer yourself to [future improvements](./future-improvements.md)._

### Context menu options

You can do the following actions, all of them are self-explanatory. Some options might not show up for certain concepts:

-   `ℹ open detail`
-   `🧲 create profile` - not for generalizations, [ref](./profiles.md)
-   `🕶 remove from view`
-   `✏ modify` - only local concepts, [ref](./modifications.md)
-   `🗑 delete` - only local concepts

## Action panel

The left bottom side of visualization has an action panel. Here you can:

-   `+` zoom in
-   `-` zoom out
-   fit to view

## Minimap

The right bottom corner of visualization has a minimap where you can see your classes, with colors as well.

## Drawbacks

Multiple relationships between two classes overlap each other, one of the [future improvements](./future-improvements.md#edge-renderings).
Context menus are not implemented in the standard way
