# Working with aggregator

You'll work with aggregator most of the time, see `/packages/core-v2/semantic-model/aggregator`. It is a component that aggregates concept data from multiple models in one place.

Whenever you create a new model, you should register it to the aggregator, eg

```ts
aggregator.addModel(model);
```

Working with models, you have the `useModelGraphContext` at your hand, it comes with all the necessary function for you to work with aggregator, add / remove models, etc.

For example adding a newly created model to aggregator is done by this simple call

```ts
useModelGraphContext().addModelToGraph(model);
```

It adds the model, generates a color to all the views for the model and so on.

## Getting the information

We also have the `useClassesContext` hook that provides all concepts sorted by their types: classes, relationships, generalizations and profiles. It also comes with functions for concept manipulation: add, remove, update.

We pump the aggregated information about concepts to the `ClassesContext` via a aggregator subscription. Whenever something changes in a model that is registered in the `aggregator`, it emit an event you can subscribe to.

That's why we register a callback right up in the `page.tsx` so that we can pump any changes, or maybe better, update changed concepts in the `ClassesContext` and provide them further in the component tree.

```ts
aggregatorView.subscribeToChanges((updated, removed) => {
    // do your magic here.
    // as we said, we update the context that provides aggregated information elsewhere
});
```

### With raws

Most of the time, aggregated information is sufficient -- showing concept detail, displaying it in the catalog, rendering it on the canvas, ...

But sometimes you need to work with the `raw` concept. That is especially useful when working with [profiles](./profiles.md). Since they inherit information from their parents(?) and override just a small portion, you can have that information from the `raw` concept. `ClassesContext` provides raw entities for you.
