
import { type EntityModel } from "@dataspecer/core-v2";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { httpFetch } from "@dataspecer/core/io/fetch/fetch-browser";

import { logger } from "../application";
import { type ModelGraphContextType } from "../context/model-context";
import { type CreateModelState, TabType } from "../dialog/model/create-model-dialog-controller";
import { createRdfsModel, createSgovModel } from "@dataspecer/core-v2/semantic-model/simplified";
import { type VisualEntityModel, VisualEntityModelImpl } from "@dataspecer/core-v2/visual-model";
import { randomColorFromPalette } from "~/app/utils/color-utils";

const SGOV_IDENTIFIER = "sgov";

export function createVocabulary(
  graph: ModelGraphContextType,
  state: CreateModelState,
) {

  const addModelFromUrl = (url: string, alias: string) => {
    void (async () => {
      const model = await createRdfsModel([url], httpFetch);
      model.fetchFromPimStore();
      addModelsToGraph(graph, [model]);
      model.alias = alias;
      const aggregatedView = graph.aggregator.getView();
      graph.setAggregatorView(aggregatedView);
    })();
  };

  const addSgov = () => {
    const model = createSgovModel("https://slovník.gov.cz/sparql", httpFetch);
    model.allowClass("https://slovník.gov.cz/datový/turistické-cíle/pojem/turistický-cíl").catch(console.error);
    model.allowClass("https://slovník.gov.cz/veřejný-sektor/pojem/fyzická-osoba").catch(console.error);
    addModelsToGraph(graph, [model]);
  };

  const addLocalModel = (alias: string) => {
    const model = new InMemorySemanticModel();
    model.setAlias(alias);
    addModelsToGraph(graph, [model]);
  };

  switch (state.activeTab) {
    case TabType.AddFromUrl:
      addModelFromUrl(state.modelUrl, state.modelAlias);
      break;
    case TabType.AddPredefined:
      for (const model of state.selectedModels) {
        if (model.url !== undefined) {
          addModelFromUrl(model.url, model.alias ?? model.label);
        } else if (model.identifier === SGOV_IDENTIFIER) {
          addSgov();
        } else {
          logger.error("Invalid predefined model.", { model });
        }
      }
      break;
    case TabType.CreateLocal:
      addLocalModel(state.modelAlias);
      break;
  }

}

function addModelsToGraph(graph: ModelGraphContextType, models: EntityModel[]) {

  // If there is no visual model, we create a default one.
  if (graph.aggregatorView.getActiveVisualModel() === null) {
    const defaultVisualModel = new VisualEntityModelImpl(undefined);
    addVisualModelToGraph(graph, defaultVisualModel);
    graph.aggregatorView.changeActiveVisualModel(defaultVisualModel.getId());
  }

  for (const model of models) {
    graph.aggregator.addModel(model);
    graph.setModels((previous) => previous.set(model.getId(), model));
    for (const [_, visualModel] of graph.visualModels) {
      visualModel.setColor(model.getId(), randomColorFromPalette());
    }
  }
}

const addVisualModelToGraph = (graph: ModelGraphContextType, model: VisualEntityModel) => {
  graph.aggregator.addModel(model);
  graph.setVisualModels((previous) => previous.set(model.getId(), model));
};