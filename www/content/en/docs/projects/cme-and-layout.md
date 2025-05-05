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
