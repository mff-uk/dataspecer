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

- `Vocabulary` - Stores classes, relationships and attributes. The vocabulary itself contains some properties:
  - name
  - IRI
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
What is profile? Basically we take existing concept, which we want to reuse, but we want to reuse it in our application context.
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
at the position of the menu. Together with the node, relationship is created. This relationship has default parameters.
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
That is new visual node representing the same underlying concept is created.

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

##### Anchoring
User can (un)anchor chosen node using the ⚓ button.

{{% tutorial-image "images/projects/cme-and-layout/anchor-node-button.png" %}}

Anchoring node means that once we run force-directed algorithm, the anchored nodes are not moved when layouting is finished.

Other algorithms unfortunately move the node, the ELK layouting library doesn't support anchoring for others.
Sure we could just run the algorithm and then not update the anchored visual nodes in the visual model, but that's simply not
really useful, since the layouting algorithm moved it, so by having it stay on old place, the layout may be significantly worse.

User can tell if node is anchored by looking at the top right corner of node. If it contains the ⚓ icon, then the node is anchored.
As seen on the following image.


{{% tutorial-image "images/projects/cme-and-layout/anchored-node-example.png" %}}

TODO: Nevim jestli odkazat na layout package, spis to zkopirovat sem a je to i s obrazky


The user can layout:
1. Whole visual model
2. Selection - Where selection means the selected nodes and selected edges going between the selected nodes

When it comes to layout of selection, I personally think that the most useful ones are (TODO: Popsane v tech druhch docs ... na druhou sstarnu tohle je popis layoutu selekce):

- Layered. For example when we combine it together with the extend selection (TODO: ODkaz v dokumentu) feature, we
can find all generalization children, and layout them, so we can have tree of depth 1
- Node overlap algorithm, this can be also useful, for example when we run force-directed algorithm for the whole diagram
and some small part of the layouted model is overlapping, or too close to each other
- It may be also useful if we want for example node and its neighborhood to layout it like star

{{% tutorial-image "images/projects/cme-and-layout/star-layout-force-directed.png" %}}


### Selection buttons

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

Possible use-case for this is for example. Put everything into canvas, but then we would like to have only the profiles
on the canvas or something similar like this.

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
Group is entity in visual model, which contains nodes or other groups.

##### Creating Group

{{% tutorial-image "images/projects/cme-and-layout/group-button.png" %}}

User can create group from selection clicking the ⛓️ button. Group from user perspective means that
when user moves node, he also moves all nodes in the group.
Note that when user performs action on selection all the nodes in group behave as selected.

Advanced explanation: Just to fully understand what is happening, there are two types of selection.
In one selection are the elements specifically selected by user, in the second are those selected by user +
those not selected by user but are part of groups. And actions on selection affect all of them.

##### Dissolving Group
Click on any node in the group, which you want to dissolve and click on the ⛓️‍💥 button.
The group will no longer exist and the nodes will be kept on place.

#### Visual nodes representing visual models
We can create special type of visual node which represents visual model from the list of available visual models in the current package using the 📦 button.

{{% tutorial-image "images/projects/cme-and-layout/creating-visual-diagram-node-from-existing.png" %}}

Similarly we can can select entities on canvas and click the 📦 button.
This creates dialogs, which asks user to insert name of to be created visual model.
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


===================================================================
===================================================================
===================================================================
===================================================================
===================================================================
===================================================================
===================================================================
===================================================================
===================================================================

# Layouting algorithms

We split the talk about into 2 sections, quick guide and detailed explanation. TODO: Odkaz na ne jako to mam u DiaSynth docs.

## I don't have time, just tell me what's good

- First you should try `force-directed with clusters` with default settings
- If you are not satisfied, just try force-directed - if it looks better, you can bump up the number of runs, which may improve results.
Just note that the gain in layout quality isn't linear.
Meaning if you run the algorithm 1 time, 10 times and 100 times, then the layout after 10 runs may be actually 10 times better than running only once, but running 100 times definitely won't be 100 times better.
- If you want to layout diagram in layers (hierarchy), use hierarchical
- If you want to make the diagram more spacy or remove overlaps use Node overlap removal algorithm.

## Detailed List of algorithms and when to use them

Layout solution is based on the ElkJS layouting library.

## Warnings
- Only force-directed algorithm (Elk Stress) takes into consideration anchors
- All algorithms remove existing edge layout on the layouted part

### Force-directed algorithms
Layouted DCAT-AP using force-directed algorithm:

{{% tutorial-image "images/projects/cme-and-layout/elk-stress-dcat-ap.png" %}}

- Should be the first class of algorithms to try if you don't know, what layout to choose or how the data looks like.

- These types of algorithms are based on physical simulation.
The resulting layout tends to be symmetric, edges being of similar length and with low amount of edge crossings.

#### [Force-directed](https://eclipse.dev/elk/reference/algorithms/org-eclipse-elk-stress.html)
- Very simple to use
  - It has single parameter - ideal edge length. The algorithm then tries to layout nodes in such a way that all edges have this length.

#### Force-directed with class profiles
Same as previous, but the algorithm is manually modified, so user can set ideal edge length between class profiles

#### Force-directed with clusters
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

#### Random

Layouted DCAT-AP using random algorithm without node overlap removal:

{{% tutorial-image "images/projects/cme-and-layout/random-dcat-ap-without-node-overlap.png" %}}


Layouted DCAT-AP using random algorithm with node overlap removal:

{{% tutorial-image "images/projects/cme-and-layout/random-dcat-ap-with-node-overlap.png" %}}


Randomly places nodes on canvas. Very basic, not really recommended to use. Basically fallback if all the other fail due to programmer error/faulty data.

#### [Node overlap removal](https://eclipse.dev/elk/reference/algorithms/org-eclipse-elk-sporeOverlap.html)


Has single parameter:
- Minimal distance between nodes

Very nice and useful algorithm. The closest node can not be closer than the provided parameter.

Most of the algorithms provide checkbox to run this algorithm after running the main algorithm.
In such cases this algorithm is run with small value (around 50).

For example the Elk stress algorithm considers the edge length, but not the node sizes, because of that node overlaps may occur even
when you would not expect it. So this algorithm removes such overlaps. It is also useful, if we want to layout only part of graph, because the nodes in the specific part are too close together.

#### Hierarchical algorithm - [Elk layered](https://eclipse.dev/elk/reference/algorithms/org-eclipse-elk-layered.html)

{{% tutorial-image "images/projects/cme-and-layout/layered-algorithm-dcat-ap.png" %}}

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

# Implementation

## Skipped algorithms:
We have initially implemented more algorithms, but later in development hid them from users for good reasons.

### [Elk Force](https://eclipse.dev/elk/reference/algorithms/org-eclipse-elk-force.html)
This algorithm is similar to the Elk stress, but while providing similar results it has some issues:
- The configuration is hard to understand and set up
- We already have Elk stress

### Automatic
It would be nice if user didn't have to think about layout at all. Just click button layout and the ideal graph layout would be provided.

Unfortunately that is highly non-trivial:

- What exactly is ideal layout? It depends on data and presentation purposes
- Can we even map that to metrics? Even if we could
  - What metrics?
    - Crossings are not enough, we have to take into account node alignment, etc.
  - How to weight them?
    - We can't do that by eye, we would have to get all possible specification diagrams and use some state search algorithm. Even then the results might not be as good.

### [Elk radial](https://eclipse.dev/elk/reference/algorithms/org-eclipse-elk-radial.html)
While nice at first sight. The algorithm does not work and I mean on the Elk layouting library level:

- Ignoring the edge length parameter
- Infinite recursion for bigger graphs

Not working examples. Well actually for some reason it sometimes work,
but try to remove some empty line and you will get error that the algorithm ran for more than 5 seconds,
which doesn't happen even for large graphs layouted through elk stress, which is much more resource heavy algorithm:
[Example of radial elk algorithm running for long time](https://rtsys.informatik.uni-kiel.de/elklive/elkgraph.html?compressedContent=IYGw5g9gTglgLgCwLYC4AEVgBMagFB4B2EWApmoQIxoDeeaaIwARqSGgERUd4C+BxMhQBMteoxZtOhYT35ES5QgGYxDJq3ZdlcgYooAWNRM3SDuhUMIBWYxqldrFwUoBsdyVsKvn+wgHYPUy5-XysADiCHQnCwpQBOKK94iwJSLDAlagBaAD4RPHTMihz8lUKMrLQ8wwriqmqy6zwAeha6pVUawgMOw0aKeNb2oqVbbtc+mwGA4bnRikDuobm5oA)
[Infinite recursion example for radial elk on online elk demonstrator](https://rtsys.informatik.uni-kiel.de/elklive/elkgraph.html?compressedContent=PTCWDsBcFMCcEMDGlQDdoBl4E8D2BXSALgAJJZ9oAoEaAGwGsA6AE1FmmVF3FICUAkgHEAEgBUq8OgHNcsUJAAWAW1II2UqlXC4W0EuACMJAN5USJOvABG9EgCIj9qgF8tOvQYBMp85Zt2jl7Obtq6+uAAzL4WVrZ0DlEh7uEGACwx-vGJaclhnuAArJlxgUV5HhEAbCUBCY5VFangAOy12Y4tTQUAHO1lPd0RAJz99eDDQwaGAAxjibNTRsZmsXULhkuGPqtZZdtb0bul44aRWxnH646Gua5aVNAs0hHGALQAfN6Pz68knwZIj8XtN-l9wGlgX8AUUaMAoYCwekEVEkbCniDUTCqijojCeri0cM4SiMjDiSAUcVsVS0S0SZSMRE2uSUSzwbMSUyDH0YZzKbRfgZ2dMZlyhUY5nzDOLMYZ3hyvLLXj4+UDGRKzmjbkA)

### [Mr. Tree](https://eclipse.dev/elk/reference/algorithms/org-eclipse-elk-mrtree.html)
Very difficult to use and configure and to integrate into application. Doesn't seem to provide any additional value over Elk layered.

## Issues

### Layouting of subgraphs

The issue lies both in our implementation and elk implementation. We have been doing a lot of experiments and debugging
with this functionality, but eventually it was disabled.
Not completely though - group of nodes is technically a subgraph. So if you ever layout graph which contains group and wonder why it looks bad, after reading this section you should understand.

For example at first I wanted to have any algorithm run with the option to layout generalization subgraphs.
User would choose the preferred edge direction in hierarchy. Then first the generalization subgraphs would be layouted
followed by layout of the subgraphs replaced by single nodes.

But here comes the big issue - Elk does support the fact that we can say about group of nodes, that they are subgraph. But it does not allow the edges to go between hierachy levels, that is from node inside subgraph to node/subgraph outside.
So we tried splitting the edges, which works, but the layout of edges becomes aboslutely unusable and the end results is
much worse than if we layouted the graph normally. If we would do the double layout manually, that is we would really replace
the subgraph with one node, instead of it being actual subgraph, we end up in the same situation.
Sure on the high level we are fine, but we don't consider the content inside the subgraph for optimal layout result. So the issue is in the fact that we need to consider whole graph when layouting, we can't just layout the subgraph and then the rest of graph.

So the issue is really highly non-trivial to solve, since even the layouting library can not deal with it.

### Layout package architecture

Index - contains the main layout method and behaves as API for the rest of the Dataspecer.

In the API user provides entities to layout and user given algorithm configurations.
Note that entities to layout can be both present and not present visual model.

Those entities are then transformed into graph representation, which is later further transformed into to the graph representation
for the layouting library (in our case ElkJS). Same transformation then takes place in the opposite direction.

When it comes to the user given algorithm configurations. Those are transformed into `ConfigurationContainer` which contains
specific `GraphTransformationActions` and `AlgorithmConfiguration` steps which need to be performed for the
concrete algorithm. The `AlgorithmConfiguration` is basically wrapper around the user given algorithm configuration. It just additionally contains the parameters transformed for the layouting library.

### Layout package directory structure:

- `configurations`
  - `elk` - Contain the elk specific configurations
    - `elk-configurations.ts` - Contains the elk classes for the different elk layouting algorithms. They hold the user given algorithm parameters and conversion of those the elk parameters.
    - `elk-utils.ts` - Contains the mappings of configuration parameters from general name to the elk specifics
  - `user-algorithm-configurations.ts` - Contains the `UserGivenAlgorithmConfigurations` - That is the layout configuration, in which
    each algorithm has specific parameters, so each algorithm has different parameters, which can be also found this file in the corresponding interfaces.
  - `algorithm-configuration.ts` - Similar to the previous one, but the distinction is that this are class implementations, while the previous ones are interfaces which are used when creating the user configurations, these are used in the layouting itself, so they take the interface in the constructor and create object of it with additional data, which make it easier to pass the information to the layouting system.
  - `configuration-factories.ts` - This file behaves as factory to create the configuration containers - that is, in the factory
based on the parameters and algorithms it constructs the container object. This is probably the most important file to look at if you are writing your own algorithm. Since you also need to extend the factory + it really helps to understand the code/workflow
  - `configuration-container.ts` - Contains the configuration containter, which stores all layouting and graph actions in order which they should be performed in `performLayoutingBasedOnConfigurations` inside the `index.ts` fle
  - `graph-conversion-action.ts` - Contains so called graph conversion actions, these are actions on graph, which are not layouting itself but somehow transform the graph or find some information about it. For example turn the graph into tree or find clusters.
- `dimension-estimators` - Contains classes used to estimate the width and height of a node. Currently there is constant estimator and more complex one which takes into consideration name, attributes, etc. and tries to estimate how big will be the node when rendered.
- `graph`
  - `graph-metrics` - Contains interface for representation of metric and implementations of some chosen metrics. Also just a interesting implementation detail, I noticed that if only metric(s) is used as name, it can sometimes result into page-block caused by some browser add-ons, possibly adblock.
  - `representation` - contains files used for representation of the graph.
- `layout-algorithms` - Contains the graph transformers a layout algorithm interface and implementations
  - `graph-transformers`
    - `graph-transformer-interface.ts` - Contains interface to implement, when new layouting library is introduced. The interface handles the transformation to the layouting library representation from the general graph representation and the conversion back or rather the update of the existing representation.
    - `elk-graph-transformer.ts` - is the implementation of the transformer for the elk layouting library.
  - `implementations` - Implements the `LayoutAlgorithm` for the corresponding layouting algorithms
  - `layout-algorithms-interfaces.ts` - Concretely the interface `LayoutAlgorithm`, which has to be implemented by any layouting algorithm.
  - `list-of-layout-algorithms.ts` - This file contains list of all implemented algorithms, this is the first place you should extend if you want to implement your own algorithm. The compiler error will then guide you to most of the places you should touch upon to add the new algorithm. But to consult this in more detail check the
  - `entity-budles.ts` - Transforms given data from semantic models into bundels to they are easier to work with, when we are creating the general graph (not the layouting library one) to layout
- `util` - Contains utility functionality needed in other parts of the package.

- `index.ts` file - Contains the main layout functions, which are exported, so they can be also used in other parts of Dataspecer
- `explicit-anchors.ts` file - Contains the functionality for anchor overriding, since sometimes we want to override the given anchor settings, for example when we are adding new nodes and edges to already existing graph (when click the show button vocabulary),
we want to keep the existing nodes in place, so we override their anchor settings.
- `graph-algorithms.ts` file - Contains some needed graph algorithms, for example to compute clusters for cluster-based layouting algorithm or to turn graph into trees, etc.

### How to implement own algorithm
1. Go into the `list-of-layout-algorithms.ts` and extend the `AlgorithmName` type and the map `ALGORITHM_NAME_TO_LAYOUT_MAPPING`
2. Fix the introduced errors by this. That is
  - Put your algorithm into `/implementations`, so it implements `LayoutAlgorithm` interface and point to it from the map.
  - Fix the errors in `elk-utils.ts`, if it is not using elk set it to the same values like `random` alfoirthm for example, if it is then set it how it should be.
  - Extend the `UserGivenAlgorithmConfigurationInterfaces` and `UserGivenAlgorithmConfigurationInterfacesUnion` by NEWLY introduced user given parameters (just check the others if you dont know how it should look, for example `UserGivenAlgorithmConfigurationLayered`)
In short just create interface, put in the correct `layout_alg` name and add the parameters. It should also extend the `UserGivenAlgorithmConfigurationBase` interface.
  - Introduce the class implementing configuration (just take a look at the `RandomConfiguration`, just create class which extend `DefaultAlgorithmConfiguration` with generic set to your `UserGivenConfiguration` or if you are extending elk, some of the elk ones) and extend the `getDefaultUserGivenAlgorithmConfigurationsMap` as all the others do it.
  - Now it should compile, but we are still not finished unfortunately, but we would notice that if we tried running the algorithm, since we would get explicit run-time errors explaining that we are not finished.
3. Go into the `user-algorithm-configurations.ts` - Contains the `UserGivenAlgorithmConfigurations` and `algorithm-configuration.ts` and introduce new configurations.
That is create new interfaces and classes and extend the `UserGivenAlgorithmConfigurations`
4. Finally introduce the new algorithm into the `configurations/configuration-factories.ts`, that is extend the switch inside the `addAlgorithmConfigurationLayoutActions` method, by looking at the other algorithms you should quickly find out how.
5. Also extend the `addToLayoutActionsInPreMainRunBasedOnConfiguration`, oterwise you will get run time error, that being said you an usually get away with not doing anything in the switch, here you should only do stuff if you want to perform something before running the layouting loop (that is the loop which runs the multiple times and chooses the best layout based on metrics.)

In step 3, when extending you may notice these 2 methods, basically since the class behaves as container for parameters from users
and internal parameters (for example in case of elk the user data transformed to elk data), this method should handle the conversion
if we add new user parameter internally (as programmer) inside the program, then these should set the underlying data (so in case of elk the elk data)
`addAlgorithmConfigurationToUnderlyingData`, `addAdvancedSettingsToUnderlyingData`

This should be all, unless new layouting library was introduced you should create new `layout-algorithms/graph-transformers/graph-transformer-interface.ts` in a similar way the elk is implemented in the same directory.

### Advanced settings
You may notice that each algorithm contains the `advanced_settings` property, this one is working, but currently unable to be set from user UI.
Basically the idea behind advanced_settings is that since elk contains ton of parameters, we would like to provide them through this setting, since it is unfeasible to have it all in user UI.

## Implementation

### CME

We will shortly describe here the architecture of the CME in general.
It makes no sense to describe, in what places each feature is implemented,
since it isn't that important and if anyone starts to work on the project,
they should be relatively quickly able to tell, where is roughly what based on the given overview here.

#### Running CME

##### Here is quick quide by me, which is more beginner friendly than the other "official" guides in github repository. But it may get deprecated over time.

- When you just want to test diagram without using packages, then there is nothing extra you need to do.
  - Run `npm install` from root directory
  - Run `npm run build` from root directory
  - Run `npm run dev` from the applications/conceptual-model-editor directory

- Running manager - sometimes you want to access packages and not only run the diagram part:
  - In the applications/conceptual-model-editor directory create .env file from .env.example
    - When you want to use the official Dataspecer backend:
      - VITE_PUBLIC_APP_BACKEND="https://tool.dataspecer.com/api"
      - When you also want to run the manager and connect it to locally running CME, create .env.local from .env and set the backend to
        - VITE_BACKEND=https://tool.dataspecer.com/api
        - And run the manager using `npm run dev` from the applications/manager
    - When you want to run backend locally set the backend variables mentioned above to http://localhost:3100
and run the backend as described [here](https://github.com/mff-uk/dataspecer/tree/main/services/backend) (that being said I am no longer able to run the backend, so not sure if it still works, might be related to the https://github.com/mff-uk/dataspecer/issues/1145)

##### The official build guides.
- The main tutorial is contained here: https://github.com/mff-uk/dataspecer/
- To build CME you can consult this page: https://github.com/mff-uk/dataspecer/tree/main/applications/conceptual-model-editor#installation


#### C4 component diagram
On very high level the CME component looks like this:

![img_6.png](c4-component-diagram-cme.png)

Where the layout is the layout package, so technically it is not part of CME.


#### Directory structure

- `action` - The actions that can user do, so basically business logic.
- `catalog (newly catalog-v2)` - represents the catalog component in CME. ![img_6.png](cme-catalog-dev-docs.png)
- `components` - Some exported React components
- `configuration` - Language options and static configuration for diagram, etc.
- `context` - Model, Class and query params context.
- `dataspecer` - Communication with backend containing packages and communication layer for core-v2 models.
- `diagram` - The diagram component of CME. Should be separated from the rest of CME. So we can swap out the rendering library if necessary.
  - `diagram-api.tsx` - The API used for communication with the rest of CME.
  - `diagram-controller.ts` - The controller handling logic for diagram component.
  - `diagram-hook.ts` - The diagram hook used to provide diagram functionality to rest of CME.
  - `diagram-model.ts` - The entities used in diagram - Node types and Edge types, etc. in diagram
  - `diagram.tsx` - The react component, which handles rendering of diagram.
- `dialog` - Contains all the dialogs available in CME.
- `features` - Some unrelated features, like autosave or color picker. Probably the features contained in header.
- `header` - The stuff related to header. ![img_6.png](cme-header.png)

`visualization.tsx` file - Creates the diagram component and handles callbacks caused by changes to entities in semantic model and changes in entities in visual model and the model itself and propagates them to the diagram component.
