import { SemanticModelAggregator } from "./semantic-model/aggregator";
import { createRdfsModel, createSgovModel } from "./semantic-model/simplified";
import { httpFetch } from "@dataspecer/core/io/fetch/fetch-browser";
import { VisualEntityModelImpl } from "./visual-model/visual-model";
import { VisualEntity } from "./visual-model/visual-entity";

const aggregator = new SemanticModelAggregator();

const sgov = createSgovModel("https://slovník.gov.cz/sparql", httpFetch);

aggregator.addModel(sgov);

const aggregatorView = aggregator.getView();

const callToUnsubscribe = aggregatorView.subscribeToChanges((updated, deleted) =>
    console.log(`⭐ Update!`, aggregatorView.getEntities())
);

sgov.allowClass("https://slovník.gov.cz/datový/turistické-cíle/pojem/turistický-cíl");
sgov.allowClass("https://slovník.gov.cz/datový/sportoviště/pojem/sportoviště");

const visualModel = new VisualEntityModelImpl();

visualModel.change(
    {
        "https://slovník.gov.cz/datový/sportoviště/pojem/sportoviště": {
            id: "sdfsdfw3advdfs34fsdfv",
            type: ["visual-entity"],
            sourceEntityId: "https://slovník.gov.cz/datový/sportoviště/pojem/sportoviště",
            visible: true,
            position: { x: 420, y: 69 },
            hiddenAttributes: [],
        } as VisualEntity,
    },
    []
);

const visualModel2 = new VisualEntityModelImpl();

visualModel2.change(
    {
        "https://slovník.gov.cz/datový/turistické-cíle/pojem/turistický-cíl": {
            id: "saasfwefcascstklnldnfv",
            type: ["visual-entity"],
            sourceEntityId: "https://slovník.gov.cz/datový/turistické-cíle/pojem/turistický-cíl",
            visible: true,
            position: { x: 100, y: 100 },
            hiddenAttributes: [],
        },
    },
    []
);

aggregator.addVisualModel(visualModel);
aggregator.addVisualModel(visualModel2);

console.log(aggregatorView.getVisualEntities());

aggregatorView.changeVisualView(visualModel.getId());

console.log("visual model", aggregatorView.getVisualEntities());

aggregatorView.changeVisualView(visualModel2.getId());

console.log("visual model 2", aggregatorView.getVisualEntities());
