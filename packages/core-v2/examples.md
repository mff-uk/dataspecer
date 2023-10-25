# Notes

- `aggregator.getView()` currently accepts no parameters and always returns the view to the whole graph

# UC01

```ts
import {isSemanticModelRelationship} from "@dataspecer/core-v2/semantic-model/concepts";
import {SemanticModelAggregator} from "@dataspecer/core-v2/semantic-model/aggregator";
import {createSgovModel} from "@dataspecer/core-v2/semantic-model/simplified";
import {httpFetch} from "@dataspecer/core/io/fetch/fetch-nodejs"; // or replace nodejs with browser

// Create aggregator which can hold multiple models and aggregate them
const aggregator = new SemanticModelAggregator();

// Create individual models (right now only one - sgov)
const sgov = createSgovModel("https://slovník.gov.cz/sparql", httpFetch);

// Add those models to the aggregator to create a model graph (currently one model supported)
aggregator.addModel(sgov);

// Create a view to a specific graph node (as we can look at different subgraphs)
const aggregatorView = aggregator.getView(sgov);

// Now we can finally read the aggregation
aggregatorView.getEntities() // Returns nothing (see following)
const callToUnsubscribe = aggregatorView.subscribeToChanges((updated, deleted) =>
    console.log(`Update! ${Object.keys(updated).length} entities updated or added and ${deleted.length} deleted.`)
); // Does nothing so far

// Search for classes *on the original model*
await sgov.search("turistický"); // array with two "classes"

// Lets add tourist destination surrounding to the graph
await sgov.allowClassSurroundings("https://slovník.gov.cz/datový/turistické-cíle/pojem/turistický-cíl");
// 🖨️ Update! 27 entities updated or added and 0 deleted.

// Lets add tourist destination type surroudings
await sgov.allowClassSurroundings("https://slovník.gov.cz/datový/turistické-cíle/pojem/typ-turistického-cíle");
// 🖨️ Update! 4 entities updated or added and 0 deleted.

// Lets un-add tourist destination class
await sgov.releaseClassSurroundings("https://slovník.gov.cz/datový/turistické-cíle/pojem/turistický-cíl");
// 🖨️ Update! 0 entities updated or added and 24 deleted.
// As you can see, not all 27 entities were deleted, because some of them (three exactly) are contained in the second query

// Lets print all classes
console.log(
    Object.values(aggregatorView.getEntities())
        .map(aggregated => aggregated.aggregatedEntity)
        .filter(isSemanticModelRelationship)
        .map(cls => cls.name["cs"])
);
// 🖨️ [ "má typ turistického cíle", "eviduje typ turistického cíle" ]

// Lets un-add the second query
await sgov.releaseClassSurroundings("https://slovník.gov.cz/datový/turistické-cíle/pojem/typ-turistického-cíle");
// 🖨️ Update! 0 entities updated or added and 7 deleted.
```

# UC02
```ts
import {SemanticModelAggregator} from "@dataspecer/core-v2/semantic-model/aggregator";
import {createSgovModel} from "@dataspecer/core-v2/semantic-model/simplified";
import {httpFetch} from "@dataspecer/core/io/fetch/fetch-nodejs";
import {InMemorySemanticModel} from "@dataspecer/core-v2/semantic-model/in-memory";
import {createClass, createRelationship} from "@dataspecer/core-v2/semantic-model/operations"; // or replace nodejs with browser
import {generate} from "@dataspecer/core-v2/semantic-model/lightweight-owl";

// Create aggregator which can hold multiple models and aggregate them
const aggregator = new SemanticModelAggregator();

// Create individual models (right now only one - sgov)
const sgov = createSgovModel("https://slovník.gov.cz/sparql", httpFetch);

// Add those models to the aggregator to create a model graph (currently one model supported)
aggregator.addModel(sgov);

// Create another model
const local = new InMemorySemanticModel();

// Add this model as well
aggregator.addModel(local);

// Create a view to the whole aggregated graph
const aggregatorView = aggregator.getView();

// Now we can finally read the aggregation
const callToUnsubscribe = aggregatorView.subscribeToChanges((updated, deleted) =>
    console.log(`⭐ Update!`, aggregatorView.getEntities())
); // Does nothing so far

// Create classes
const personId = local.executeOperation(createClass({
    name: {cs: "Person"},
})).id;

const petId = local.executeOperation(createClass({
    name: {cs: "Pet"},
})).id;

await sgov.allowClass("https://slovník.gov.cz/datový/turistické-cíle/pojem/turistický-cíl");

local.executeOperation(createRelationship({
    name: {cs: "has pet"},
    ends: [{
        concept: personId
    }, {
        concept: petId
    }],
}));

local.executeOperation(createRelationship({
    name: {cs: "favourite tourist destination"},
    ends: [{
        concept: personId
    }, {
        concept: "https://slovník.gov.cz/datový/turistické-cíle/pojem/turistický-cíl"
    }],
}));

// Obtain final entities without any additional metadata
const entities = Object.values(aggregatorView.getEntities()).map(aggregated => aggregated.aggregatedEntity);
console.log(await generate(entities));
```