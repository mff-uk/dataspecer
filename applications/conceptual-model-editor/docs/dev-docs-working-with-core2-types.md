# @dataspecer/core-v2 types

Dataspecer core-v2 package defines how the types of concepts look like, i'll list them here for you. With some remarks, I struggled with it so you don't have to.

## Classes and class profiles

```ts
const johnClass: SemanticModelClass = {
    name: { en: "john", cs: "honza" },
    id: "123abc123",
    type: ["class"],
    description: { en: "that's john", cs: "to je honza" },
    iri: "https://concepts.com/entities#john",
};
```

Class is alright, class profile just defines

```ts
const johnClassProfile: SemanticModelClassUsage = {
    name: { it: "giovanni" }, // we override the name, only italian translation will be available
    id: "123def567",
    type: ["class-usage"],
    description: null, // inherit the description though
    iri: "https://concepts.com/entities#john-profile", // iri has to be set always
    usageOf: "123abc123", // id of the profiled concept
    usageNote: { en: "cool reason for the rename" },
};
```

This is how you'd see the [raw](./dev-docs-working-with-aggregator.md#with-raws) concept. Aggregated information about `johnClassProfile` would contain what you see in the example and also the description from the profiled class, meaning:

```ts
const johnClassProfileAggregated: SemanticModelClassUsage = {
    id: "123def567",
    type: ["class-usage"],
    name: { it: "giovanni" },
    description: { en: "that's john", cs: "to je honza" },
    iri: "https://concepts.com/entities#john-profile",
    usageOf: "123abc123",
    usageNote: { en: "cool reason for the rename" },
};
```

## Relationships and profiles

Same logic with inheritance holds for relationship profiles.

```ts
const lovesRelationship: SemanticModelRelationship = {
    id: "789ghi789",
    type: ["relationship"],
    name: {},
    description: {},
    iri: null,
    ends: [
        {
            concept: "123abc123", // id of source concept
            name: {},
            description: {},
            iri: null, // no iri here
        },
        {
            concept: "456def456", // id of target concept
            name: { en: "loves", cs: "miluje" },
            description: { en: "the emotion people feel for each other" },
            iri: "https://concepts.com/entities#loves",
        },
    ],
};
```

We only work with directed edges / relationships, we derive the direction from the iri that is in one of the relationship ends. As you can see, you could have as many as 69 or 0 ends. We only support 2 in `dscme`.

The relationship direction leads from an end that:

-   is without iri
-   has empty or missing name
-   has empty or missing description

to an end that:

-   has an iri
-   has whatever name and description

That's how it is, so watch out when you have to develop something regarding edges. And **always** consult with the research group.

## Generalizations

Generalizations are self-explanatory

```ts
const isParentOf: SemanticModelGeneralization = {
    id: "098mno098",
    type: ["generalization];
    child: "456def456"; // id of child
    parent: "123abc123"; // id of parent
    iri: "https://concepts.com/entities#is-parent-of";
}
```

We only do generalizations of concepts with the same type, however this interface is so woke 🌈, it allows you to do anything.
