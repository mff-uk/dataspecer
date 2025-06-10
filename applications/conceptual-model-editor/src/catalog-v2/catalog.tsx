import { useModelGraphContext } from "../context/model-context";
import { useActions } from "../action/actions-react-binding";
import { renderCatalogTree } from "./catalog-view";
import { useOptions } from "../configuration";
import { useEffect, useMemo, useState } from "react";
import { useController } from "./catalog-controller";
import { createDefaultCatalogState } from "./catalog-state-factory";

export const Catalog = () => {
  const actions = useActions();

  const { language } = useOptions();
  const { aggregatorView, models } = useModelGraphContext();
  const [state, setState] = useState(createDefaultCatalogState());

  const visualModel = aggregatorView.getActiveVisualModel();

  // Controller.
  const controller = useMemo(
    () => useController(actions, setState),
    [actions, setState]);

  // Initial state and full reloads.
  useEffect(() => {
    controller.buildLayout(aggregatorView, models, language);
  }, [controller, aggregatorView, models, language]);

  // React to change of the semantic model.
  useEffect(() => {
    const unsubscribe = aggregatorView.subscribeToChanges((_updated, _removed) => {
      controller.buildLayout(aggregatorView, models, language);
    });
    return () => unsubscribe();
  }, [controller, aggregatorView, models, language]);

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
  }, [controller, aggregatorView, visualModel, language, models]);

  return renderCatalogTree(controller, state);
};
