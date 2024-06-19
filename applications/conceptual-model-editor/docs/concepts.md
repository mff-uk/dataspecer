[back to main](./main.md)

# Concepts

-   classes
-   relationships
-   attributes, special form of a relationship
-   generalizations
-   class profiles
-   relationship profiles
-   attribute profiles

## Creating a concept

-   class
    -   [create class row](./concepts-catalog.md#creating-a-new-class) in local model catalog
    -   `alt`+click in [visualization](./visualization.md#placing-a-class-on-canvas)
-   relationship
    -   connect two classes / class profiles [on canvas](./visualization.md#creating-relationships)
-   attributes
    -   in class [modification dialog](./dialogs.md#modification-dialog), makes the modified class the domain of the attribute
-   generalizations
    -   connect two classes / class profiles [on canvas](./visualization.md#creating-relationships) and choose the connection to be a `generalization`
    -   in the [modification dialog](./dialogs.md#modification-dialog) you can make the modified concept a specialization of another concept of the same type (make it a child)
-   profiles
    -   only profile an existing concept
    -   click the `🧲 create profile` button in [concept row](./concepts-catalog.md#action-buttons) or in the [context menu](./visualization.md#context-menus) on canvas

## Modify a concept

You can modify concepts in the [modification dialog](./dialogs.md#modification-dialog), they need to be from the [local model](./models.md#local-model).

## Delete a concept

You can delete only concepts from the [local models](./models.md#local-model).

## Profile a concept

You can profile any concept. Make sure to have a [local model](./models.md#local-model) in your workspace. The created profile will be placed there.

## Types

### Class

Has following _features?_

-   name (multi-language)
-   description (multi-language)
-   iri
    -   relative -> we take the model's base iri and concatenate it with this relative iri
    -   absolute -> you specify the whole iri including the protocol

### Relationship

-   name (multi-language)
-   description (multi-language)
-   iri
    -   relative -> we take the model's base iri and concatenate it with this relative iri
    -   absolute -> you specify the whole iri including the protocol
-   domain (the concept where the relationship starts)
-   domain cardinality
-   range (the concept where the relationship ends)
-   range cardinality

### Attribute

-   name (multi-language)
-   description (multi-language)
-   iri
    -   relative -> we take the model's base iri and concatenate it with this relative iri
    -   absolute -> you specify the whole iri including the protocol
-   domain (the concept that has the attribute)
-   domain cardinality
-   datatype

### Generalization

-   iri
    -   relative -> we take the model's base iri and concatenate it with this relative iri
    -   absolute -> you specify the whole iri including the protocol
-   child (the concept that generalizes the other)
-   parent

### Class profile

You can profile a class or even a class profile, eg dcat:Dataset, dcat-ap:Dataset, dcat-ap-cz:Dataset. Field are

-   iri
-   usage note (how is this profile supposed to be used)

and optionally you can change these for profile

-   name
-   description

### Relationship profile

You can profile a relationship or even a relationship profile. Field are

-   iri
-   usage note (how is this profile supposed to be used)

and optionally you can change these for profile

-   name
-   description
-   domain
-   domain cardinality
-   range
-   range cardinality

### Attribute profile

You can profile an attribute or even an attribute profile. Field are

-   iri
-   usage note (how is this profile supposed to be used)

and optionally you can change these for profile

-   name
-   description
-   domain
-   domain cardinality
-   datatype
