---
title: "Helping users in creating diagrams for data specifications"
author: Radek Strýček
menu:
  docs:
    parent: "projects"
weight: 40
toc: true
---

# Conceptual-Model-Editor (CME) - user documentation

This document explains what features are available in CME and how, why and when to use them.
We almost exclusively focus on the functionalities developed in project. For completeness some necessary functionalities are also described.

In short the conceptual model editor allows user to create new concepts and modify or profile existing concepts.

Existing concepts could be created by us in the same project or they could be used from some vocabulary on web.

Note that concepts from the web vocabularies can not be edited. They can only be profiled.

CME behaves like classic conceptual modelling with the additional option to reuse existing vocabularies and
the concept of profiling.

**Terms:**
- `Package` - You can think of it as a directory. CME's goal is then to allow view and modify subset of this package. Where the subset are semantic models (also called `Vocabularies`) and the `visual models`,

{{% tutorial-image "images/projects/cme-and-layout/package-manager.png" %}}

- `Vocabulary` - Stores classes, relationships and attributes and profiles. The vocabulary itself contains some properties:
  - Name
  - IRI
  - Color
- `Class` - Named semantic concept. Class has the following properties
  - Name
  - IRI
  - Definition
  - and it belongs to exactly one model
- `Relationship` - Semantic concept, which represents connection between two classes. It has the same properties as class - name, IRI, definition
- `Attribute` - Special type of relationship, which has one end as class and other as data type.
This is from semantic perspective, but in conceptual modelling when it comes to visuals, we want to sometimes show relationship as attribute,
that is instead of drawing edge between two nodes, it appears as text on node. The terms about visual entities are explained couple of lines down.
- `Profile` - We can create profile of the above mentioned concepts, that is classes, relationships, attributes.
What is profile? Basically we take existing concept, which we want to reuse, but we want to reuse it in our application context. The application context is defined by the usage note and the fact that we can override properties of the profiled entity, for example name. Profilling isn't mapping 1:1 but one-to-many, so if we create class profile, it can be profile of many different classes (and class profiles).
- `Visual model` (Sometimes also called `View`) - This is some kind of visual representation of underlying semantic concepts.
The representation doesn't necessary have to contain all of the semantic concepts and neither does the mapping have to be 1:1.
For example we can have one semantic entity represented by more than one visual, or the semantic entities can be "stored" inside
another visual model, which we represent by special type of node.
Within one package, there can be more than one visual model.
- `Active Visual model` - The currently shown visual model inside CME.
- `Visual entity` - Visual element, either node or edge.
- `Node` - Can be thought of as graph node. That is something, which can be possible edge end.
Currently there are two types of nodes.
  - Node representing semantic class.
  - Node representing visual model.
- `Edge` - Connects two nodes. Again multiple types.
  - Edge, which visually represents underlying semantic association (relationship)

  {{% small-image "images/projects/cme-and-layout/association-edge.png" %}}

  - Edge representing generalization

  {{% small-image "images/projects/cme-and-layout/generalization-edge.png" %}}

  - Visually representing relationship profile - Same visual as association.
  - And finally edges representing the connection between class and class profile.

    {{% small-image "images/projects/cme-and-layout/profile-to-class-profile-edge.png" %}}

## CME general view
Cme can be split into three main parts:
- Header - At the time of writing the documentaiton, it is seen on top. It contains general controls for CME. Like setting language, saving or controlling visual models for the package.
- Catalog - Contains the semantic information about package and visual information relevant to currently active visual model. In the time of writing documentation it is the component seen on the left
- Canvas - Takes the most part of the screen. Contains the visual representation of the visual model with nodes and edges.

{{% tutorial-image "images/projects/cme-and-layout/catalog-canvas-header.png" %}}


## Working with views/visual models
### Creating visual models
The user can create new visual model as can be seen on the following image.

{{% tutorial-image "images/projects/cme-and-layout/create-new-visual-model-button.png" %}}


Once clicked, user is presented with dialog, where he puts information about the new visual model. By confirming
the dialog, new visual model is created and active visual model is set to the created one.

#### Changing active visual model

User can also change currently active visual model to some of the existing.

{{% tutorial-image "images/projects/cme-and-layout/change-visual-model.png" %}}

## Catalog actions

Catalog is the

### Actions on vocabularies

#### Showing/hiding all elements in semantic vocabulary

{{% tutorial-image "images/projects/cme-and-layout/catalog-vocabulary-visibility-v2.png" %}}

- Puts all classes and relationships from chosen semantic model on canvas. But note that, if we have relationship,
  which has at least one end from different semantic model and the end is NOT present on the canvas, then it is not added.
  To explain it exactly:
  - Both ends of the relationship lie in the chosen semantic model. The relationship is always added.
  - At least one end does not lie in the chosen semantic model. The relationship is added only when the end from the other models are present in visual model (that is on canvas).
- Hide works as expected

### Catalog actions on entities

{{% tutorial-image "images/projects/cme-and-layout/catalog.png" %}}

#### Target button

{{% tutorial-image "images/projects/cme-and-layout/target_button2.png" %}}

When this button is clicked the viewport is moved to the relevant entity. Which is

- For attributes:
  - The visual nodes representing the class on which can be the attribute found (in other words domain class)
    - Note that if there is visual node for the relevant class, but the attribute is not visible on the node itself,
      then it counts as if the attribute is not present.
- For classes (and class profiles):
  - The visual node representing semantic class
- For relationships
  - The visual relationship representing semantic relationship

Since we support to have more than one visual entity for the semantic one, the target button behaves as iterator
over all the visual entities, which represent the semantic one.

#### Showing neighborhood

{{% tutorial-image "images/projects/cme-and-layout/show_neighborhood2.png" %}}

Again the results depends on the entity it is used for.
Basically it adds all entities in distance at most one to the visual model.

Explicitly it means:
- For classes add
  - All attributes on the class
  - All relationship types going from the class together with their ends (if not present)
    - If the end is present, then just add the relationship
  - All profiled classes, class profiles
- For attributes add
  - Just the class (without any attributes)
  - The attribute itself
    - Again if the class is already present in visual model, just add the attribute to all its representations and don't add the class to visual model again
- For relationship add
  - The ends
  - The relationship
    - Again if the end is present don't add it and just the end the relationship between the relevant ends.

## Canvas actions

### Drag edge to canvas menu
Dragging edge from visual node to canvas opens menu.

This menu contains the following options:

{{% tutorial-image "images/projects/cme-and-layout/canvas-menu.png" %}}

- Create relationship (association) target - This option creates new target of relationship.
That means, new dialog is shown to create class. After confirmation new node representing the class is put
at the position of the menu. Relationship is created together with the node. This relationship has default parameters.
The source class is the class from which the dragging started. The target one is the created class.
- Create relationship (association) source - Same as previous except the class from which we started the dragging is target and the newly
created class is the source of the relationship
- Create generalization parent - As the relationship target, but now the type of edge is generalization.
- Create generalization child - As the relationship source, but now the type of edge is generalization.

### Node actions

{{% tutorial-image "images/projects/cme-and-layout/node-actions.png" %}}

#### Duplication
{{% tutorial-image "images/projects/cme-and-layout/node-actions-duplication.png" %}}

User can create duplicate of node by clicking the `⿻` button.
Creation node duplicate = New visual node representing the same underlying concept is created.

Note: This feature is still not fully developed. So even though it works,
some operations may be difficult to perform,
therefore currently the usual use-case is:
1. Have fully-connected visual node
2. Create bunch of duplicates
3. Then for each duplicate choose the parts you want to show


#### Manipulate attributes

##### Manipulate attributes directly on node
By clicking on node, user can notice buttons next to the attributes:

{{% tutorial-image "images/projects/cme-and-layout/attribute-buttons-on-node.png" %}}

Those allows user from to (From left to right):
- Move attribute one position up in node
- Move attribute one position down in node
- Hide attribute from node.
- Edit the semantic information about attribute

In cases when user wants to perform more operations with attributes connected to the node representing underlying class,
he can choose the following option


##### Manipulate attributes through dialog

{{% tutorial-image "images/projects/cme-and-layout/edit-attribute-visibility-button.png" %}}

User can click the 📏 button as seen on the image above. This button allows user to choose which attributes should be visible on the node.

User is presented with the following dialog.


{{% tutorial-image "images/projects/cme-and-layout/edit-attributes-visibility-dialog.png" %}}

The dialog contains two columns. The first column contains the attributes currently visible on the node.
The second column contains the present semantic attributes on the underlying class, which are not currently visible on the node.

Newly it can also contain relationships, but that was not developed in the project.


#### Layouting

Layouting is described separately, you can check it [here](layout-algorithms.md)

##### Anchoring
User can (un)anchor chosen node using the ⚓ button.

{{% tutorial-image "images/projects/cme-and-layout/anchor-node-button.png" %}}

Anchoring node means that once we run force-directed algorithm, the anchored nodes are not moved when layouting is finished.

Other algorithms unfortunately move the node, the Elk layouting library doesn't support anchoring for others.
Sure we could just run the algorithm and then not update the anchored visual nodes in the visual model, but that's simply not
really useful, since the layouting algorithm moved it, so by having it stay on old place, the layout may be significantly worse.

User can tell if node is anchored by looking at the top right corner of node. If it contains the ⚓ icon, then the node is anchored.
As seen on the following image.


{{% tutorial-image "images/projects/cme-and-layout/anchored-node-example.png" %}}


The user can layout:
1. Whole visual model
2. Selection - Where selection means the selected nodes and selected edges going between the selected nodes

## Layouting algorithms

We split the talk about into 2 sections, quick guide and detailed explanation.

### I don't have time, just tell me what's good

#### Layouting of visual model

- First you should try `force-directed with clusters` with default settings
- If you are not satisfied, just try force-directed - if it looks better, you can bump up the number of runs, which may improve results.
Just note that the gain in layout quality isn't linear.
Meaning if you run the algorithm 1 time, 10 times and 100 times, then the layout after 10 runs may be actually 10 times better than running only once, but running 100 times definitely won't be 100 times better. After certain number it is just waste of time. I think that on mid-sized graphs 10-50 should be the range to look for.
- If you want to layout diagram in layers (hierarchy), use hierarchical
- If you want to make the diagram more spacy or remove overlaps use Node overlap removal algorithm.

#### Layouting of selection


When it comes to layout of selection, I personally think that the most useful ones are:

- Layered (hierarchical). For example when we combine it together with the extend selection feature, we
can find all generalization children, and layout them, so we can have tree of depth 1
- Node overlap algorithm, this can be also useful, for example when we run force-directed algorithm for the whole diagram
and some small part of the layouted model is overlapping, or too close to each other
- Sometimes It may be also useful to use force-directed algorithm, for example if we want node and its neighborhood to layout like star:

{{% tutorial-image "images/projects/cme-and-layout/star-layout-force-directed.png" %}}


### Detailed List of algorithms and when to use them

Layout solution is based on the ElkJS layouting library.

### Warnings
- Only force-directed algorithm (Elk Stress) takes into consideration anchors
- All algorithms remove existing edge layout on the layouted part
- The layouting of groups is not optimal, for reason why you can check the [technical documentation for layout package](https://github.com/mff-uk/dataspecer/tree/main/packages/layout).

#### Force-directed algorithms
Layouted DCAT-AP using force-directed algorithm:

- Should be the first class of algorithms to try if you don't know, what layout to choose or how the data looks like.

- These types of algorithms are based on physical simulation.
The resulting layout tends to be symmetric, edges being of similar length and with low amount of edge crossings.

- They are run multiple times, which is controlled by the number of runs parameter. After the runs, best layout is chosen, where the best layout is the one with best metric values. `Metric` is value, which describes how good certain layout is. There are many metrics, we have implemented the most important ones based on articles. The edge-edge crossings and edge-node crossings. But there are more like area, orthogonality, edge crossing angle, etc.

##### [Force-directed](https://eclipse.dev/Elk/reference/algorithms/org-eclipse-Elk-stress.html)

{{% tutorial-image "images/projects/cme-and-layout/Elk-stress-dcat-ap.png" %}}

- Very simple to use
  - It has single parameter - ideal edge length. The algorithm then tries to layout nodes in such a way that all edges have this length.

##### Force-directed with class profiles
Same as previous, but the algorithm is manually modified, so user can set ideal edge length between class profiles

##### Force-directed with clusters
Layouted DCAT-AP using cluster based algorithm without edge layout of clusters:

{{% tutorial-image "images/projects/cme-and-layout/cluster-alg-dcat-ap-without-edge-layout.png" %}}

Layouted DCAT-AP using cluster based algorithm with edge layout of clusters:


{{% tutorial-image "images/projects/cme-and-layout/cluster-alg-dcat-ap-with-edge-layout.png" %}}

This algorithm isn't in Elk layout library, it was designed and implemented specially for this project.

This algorithm seems to provide very good initial results for most of the semantic vocabularies. Sometimes even on-par with the manually made layouts.

The idea came by looking at DCAT-AP, layouting it with Elk stress algorithm and playing with the layout a bit.

Idea on high-level:
1. We want to find clusters,
2. layout them and
3. then layout the graph with clusters.

Implementation:
1. Find clusters
   - Find nodes, which are directly connected to at least one leaf. Those are initial clusters.
   - Recursively connect clusters, so they are maximal (that is going from leafs, if cluster is connected to exactly one more cluster, merge them)
   - Possible improvement: I also thought about the idea that cluster = graph articulation (nodes, which after removal split the graph into more components).
   But the results seemed to be worse, so I abandoned this idea. But maybe when somebody would spend couple of weeks with it, it could be improved.
2. Layout graph using Elk stress
3. For each cluster find least populated sector, that is with least nodes and edges.
   - Layout the cluster using Elk layered with the direction being Up, Right, Down, Left - based on the least populated sector.
4. Layout graph using Elk stress again. Only the nodes not being part of clusters = that is neither the cluster roots and neither the nodes inside cluster.

##### Random

Layouted DCAT-AP using random algorithm without node overlap removal:

{{% tutorial-image "images/projects/cme-and-layout/random-dcat-ap-without-node-overlap.png" %}}


Layouted DCAT-AP using random algorithm with node overlap removal:

{{% tutorial-image "images/projects/cme-and-layout/random-dcat-ap-with-node-overlap.png" %}}


Randomly places nodes on canvas. Very basic, not really recommended to use. Basically fallback if all the other fail due to programmer error/faulty data.

##### [Node overlap removal](https://eclipse.dev/Elk/reference/algorithms/org-eclipse-Elk-sporeOverlap.html)


Has single parameter:
- Minimal distance between nodes

Very nice and useful algorithm. The closest node can not be closer than the provided parameter.

Most of the algorithms provide checkbox to run this algorithm after running the main algorithm.
In such cases this algorithm is run with small value (around 50).

For example the Elk stress algorithm considers the edge length, but not the node sizes, because of that node overlaps may occur even
when you would not expect it. So this algorithm removes such overlaps. It is also useful, if we want to layout only part of graph, because the nodes in the specific part are too close together.

##### Hierarchical algorithm - [Elk layered](https://eclipse.dev/Elk/reference/algorithms/org-eclipse-Elk-layered.html)

{{% tutorial-image "images/projects/cme-and-layout/layered-algorithm-dcat-ap.png" %}}

**Description taken from the Elk library reference:**

This algorithm is based on the algorithm proposed by Sugiyama, Tagawa and Toda in 1981.

It emphasizes the direction of edges by pointing as many edges as possible into the same direction. The nodes are arranged in layers, which are sometimes called “hierarchies”, and then reordered such that the number of edge crossings is minimized. Afterwards, concrete coordinates are computed for the nodes and edge bend points.

Parameters:
- Distance between nodes within layer
- Distance between layers
- The emphasized direction
- Edge routing type
  - Orthogonal

  {{% tutorial-image "images/projects/cme-and-layout/orthogonal-edge-routing.png" %}}

  - Splines

  {{% tutorial-image "images/projects/cme-and-layout/splines-edge-routing.png" %}}

  - Polylines

  {{% tutorial-image "images/projects/cme-and-layout/polylines-edge-routing.png" %}}


### Selection actions

When user performs selection on more than 1 entity, the following buttons are shown.


{{% tutorial-image "images/projects/cme-and-layout/selection-buttons-overview.png" %}}

#### Alignment
User can automatically align selected nodes using the button highlighted with red circle on the following picture.

{{% tutorial-image "images/projects/cme-and-layout/alignment-manual-first-menu.png" %}}

After clicking the button user is faced with possible alignment options:

{{% tutorial-image "images/projects/cme-and-layout/alignment-manual.png" %}}

#### Changing elements present in selection
##### Extending selection

{{% tutorial-image "images/projects/cme-and-layout/extend-selection-button.png" %}}

By clicking the 📈 button, the user is presented with the following dialog, which allows them to systematically extend selection.

{{% tutorial-image "images/projects/cme-and-layout/extend-selection.png" %}}


We have the option to select only the edges or also edges together with ends. As seen on the following image.

{{% tutorial-image "images/projects/cme-and-layout/extend-selection-only-edges.png" %}}

We can perform the following extensions of selection
(Keeping the column order in description that is outgoing -> incoming):
- Through relationship (association)
  - target
  - source
- Through generalization
  - target
  - source
- Through relationship (association) profile
  - target
  - source
- Through class profile
  - the profiled class
  - the class profile

###### How to use such feature - Example

1. Perform the extension itself

Let's say that you are interested how far can you reach if you went from the current selection only through relationship profiles
and the possible class profiles.

So you select the following checkboxes


{{% tutorial-image "images/projects/cme-and-layout/extend-selection-example-start.png" %}}

Now you click the `Extend`, which extends the current selection by the chosen options,
that is through all the class profiles and relationship profiles (and their ends) going
from the current selection.

This new state is saved as internal selection, now you can keep clicking the `Extend` button until you are happy.

After that you can either click the <span style="color:red">❌ Cancel</span> button, this will forget all the changes to the selection and
keep the selection which existed before opening this dialog.

Or you can click the <span style="color:green">✅ Accept</span> button, which takes the internal state and uses it as the
current selection in the diagram, that is all the changes which happened through the extension are saved.

2. What to do next once we have the extension:

- We can further change the selection using the filtering, which is described in the following section
- Perform actions on the selection - For example to put it into new diagram or to create visual diagram node from it.




##### Filtering selection

{{% tutorial-image "images/projects/cme-and-layout/filter-selection-button.png" %}}

By clicking the 📉, to user is shown the following dialog, which allows him to filter/restrict current selection.

{{% tutorial-image "images/projects/cme-and-layout/filter-selection.png" %}}

The selection is restricted to the chosen options, which can be any combination of the following:
- Classes
- Class profiles
- Relationships
- Relationship profiles
- Generalizations

Possible use-case is for example: Put everything on canvas, choose everything except profiles, hide it, which results in only the profiles being present on the canvas.

#### Actions on selection


{{% tutorial-image "images/projects/cme-and-layout/action-button-overview.png" %}}


When clicked, then user can perform the following operations the selected concepts:

{{% tutorial-image "images/projects/cme-and-layout/action-buttons-list-overview.png" %}}

From left to right:

1. Remove from semantic model
2. Remove from visual model (hide on canvas)
3. Create new view from selection - New view with selected entities is created, but we don't switch to the newly created view,
neither remove the selection from currently active visual model.
4. Profile selection - The behavior is following:

- If class (or class profile) is selected its profile is created (exactly once - this is important as seen in example, also thanks to this the profile of model should behave as expected)
- If relationship is selected, 2 class profiles are created, one for each end. Then relationship between the class profiles is created.

Complex use-cases:
- Creating profiles of selected relationships sharing end:
  - **Case 1**: Without the shared end selected. Then each relationship has different ends.
  - **Case 2**: With the shared end selected. Then the shared end is created exactly once and both edges are pointing to it.

#### Start state:

{{% tutorial-image "images/projects/cme-and-layout/profile-selection-start-state.png" %}}

Note: The class profile and profiled class share position. On the left and on the right

#### Case 1:

{{% tutorial-image "images/projects/cme-and-layout/profile-selection-without-profiling-shared-end.png" %}}


#### Case 2:

{{% tutorial-image "images/projects/cme-and-layout/profile-selection-with-profiling-shared-end.png" %}}

#### Groups
Group is entity in visual model, which contains nodes and/or other groups.

##### Creating Group

{{% tutorial-image "images/projects/cme-and-layout/group-button.png" %}}

User can create group from selection clicking the ⛓️ button. Group from user perspective means that
when user moves node, he also moves all nodes in the group. It also behaves as one node in context of layouting.
In other words the relative positions between nodes in group are always kept

Note that when user performs action on selection, all the nodes in group behave as selected.

##### Dissolving Group
Click on any node in the group, which you want to dissolve and click on the ⛓️‍💥 button.
The group will no longer exist. The positions of nodes inside group won't be affected.

#### Visual nodes representing visual models
We can create special type of visual node which represents visual model from the list of available visual models in the current package using the 📦 button.

{{% tutorial-image "images/projects/cme-and-layout/creating-visual-diagram-node-from-existing.png" %}}

Similarly we can can select entities on canvas and click the 📦 button.
This creates dialog, which asks user to insert name of to be created visual model.
The selected entities are removed from the canvas, put into the new visual model and in the current visual model,
the visual diagram node referencing the newly created visual model is created.

{{% tutorial-image "images/projects/cme-and-layout/creating-visual-diagram-node-new.png" %}}

This type of node have some extra buttons compared to the visual nodes representing classes.

- 🌳 button puts on canvas all currently not visible relationships, which have exactly one end in the
node representing visual model.

{{% tutorial-image "images/projects/cme-and-layout/put-all-edges-related-to-visual-diagram-node-on-canvas-button.png" %}}

- 🗺️ button changes active visual model (that is the one that is shown) to the one represented by the visual node.

{{% tutorial-image "images/projects/cme-and-layout/move-to-represented-visual-model-button.png" %}}


- 💥 - Removes the node from active visual model and puts its content to the active visual model.
In other words the visual diagram node is replaced by its content.

{{% tutorial-image "images/projects/cme-and-layout/put-represented-visual-diagram-on-canvas-and-remove-visual-diagram-node.png" %}}


All the other buttons behave as expected, that is the info button shows basic detail about the node and the edit button allows
to change the name of the visual model.

Similarly to the duplicates, the functionality isn't yet fully fleshed out in a sense that it is not the most user-friendly as it can be.
However it should still support all the possible use-cases.
