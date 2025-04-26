import { useModelGraphContext } from "../context/model-context";
import { useActions } from "../action/actions-react-binding";
import { renderCatalogTree } from "./catalog-view";
import { useOptions } from "../configuration";
import { useEffect, useState } from "react";
import { useController } from "./catalog-controller";
import { createDefaultCatalogState } from "./catalog-state-factory";

export const Catalog = () => {
  const actions = useActions();

  const { language } = useOptions();
  const { aggregatorView, models } = useModelGraphContext();
  const [state, setState] = useState(createDefaultCatalogState());

  const visualModel = aggregatorView.getActiveVisualModel();

  // Initial state and full reloads.
  useEffect(() => {
    controller.buildLayout(aggregatorView, models, language);
  }, [aggregatorView, models, language]);

  // React to change of the semantic model.
  useEffect(() => {
    const unsubscribe = aggregatorView.subscribeToChanges((_updated, _removed) => {
      controller.buildLayout(aggregatorView, models, language);
    });
    return () => unsubscribe();
  }, [aggregatorView, models, language]);

  // React to changes of the visual model.
  useEffect(() => {
    if (visualModel === null) {
      return;
    }
    const unsubscribe = visualModel.subscribeToChanges({
      modelColorDidChange(_identifier, _next) {
        controller.buildLayout(aggregatorView, models, language);
      },
      visualEntitiesDidChange(_entities) {
        controller.buildLayout(aggregatorView, models, language);
      },
    });
    return () => unsubscribe();
  }, [aggregatorView, visualModel]);

  // Controller.
  const controller = useController(actions, setState);

  return renderCatalogTree(controller, state);
};
