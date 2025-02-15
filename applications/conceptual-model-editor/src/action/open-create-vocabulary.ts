import { createRdfsModel, createSgovModel } from "@dataspecer/core-v2/semantic-model/simplified";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { EntityModel } from "@dataspecer/core-v2";
import { WritableVisualModel } from "@dataspecer/core-v2/visual-model";
import { httpFetch } from "@dataspecer/core/io/fetch/fetch-browser";

import { createLogger } from "../application";
import { ModelGraphContextType } from "../context/model-context";
import { DialogApiContextType } from "../dialog/dialog-service";
import { createAddModelDialog } from "../dialog/model/create-model-dialog";
import { CreateModelState, TabType } from "../dialog/model/create-model-dialog-controller";
import { randomColorFromPalette } from "../util/color-utils";
import { createDefaultWritableVisualModel } from "../dataspecer/visual-model/visual-model-factory";

const LOG = createLogger(import.meta.url);

export function openCreateVocabularyAction(
  dialogs: DialogApiContextType,
  graph: ModelGraphContextType,
) {
  const onConfirm = (state: CreateModelState) => {
    createVocabulary(graph, state);
  };
  dialogs.openDialog(createAddModelDialog(onConfirm));
}

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
        LOG.error("Invalid predefined model.", { model });
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
    console.warn("Creating default visual model.")
    const visualModel = createDefaultWritableVisualModel(models);
    graph.aggregatorView.changeActiveVisualModel(visualModel.getId());
  }

  for (const model of models) {
    graph.aggregator.addModel(model);
    graph.setModels((previous) => previous.set(model.getId(), model));
    for (const [_, visualModel] of graph.visualModels) {
      visualModel.setModelColor(model.getId(), randomColorFromPalette());
    }
  }
}

const addVisualModelToGraph = (graph: ModelGraphContextType, model: WritableVisualModel) => {
  graph.aggregator.addModel(model);
  graph.setVisualModels((previous) => previous.set(model.getId(), model));
};
