import React, { useContext, useEffect, useMemo, useRef, useState } from "react";

import { EntityModel } from "@dataspecer/core-v2";
import { HexColor, VisualModel } from "@dataspecer/core-v2/visual-model";
import { AggregatedEntityWrapper, SemanticModelAggregatorView } from "@dataspecer/core-v2/semantic-model/aggregator";

import { UiAssociation, UiAssociationProfile, UiAttribute, UiAttributeProfile, UiClass, UiClassProfile } from "./ui-model";
import { initializeState, onAddEntityModels, onAddVisualEntity, onChangeSemanticModel, onChangeVisualModel, onRemoveEntityModel, onRemoveVisualEntity, UiModelServiceState } from "./ui-model-service";
import { EntityDsIdentifier, ModelDsIdentifier } from "../entity-model";
import { configuration } from "../../application";
import { createEmptyUiState } from "./ui-model-utilities";

export type UiModelStateContext = UiModelServiceState;

const context = React.createContext<UiModelStateContext>({
  ...createEmptyUiState(),
  defaultWriteModel: null,
});

/**
 * Provide context for reading current values and updating the state.
 * The context does not change when values change.
 */
export interface UiModelApiContext {

  getClass: (identifier: EntityDsIdentifier, model: ModelDsIdentifier) => UiClass | null;

  getClassProfile: (identifier: EntityDsIdentifier, model: ModelDsIdentifier) => UiClassProfile | null;

  getAttribute: (identifier: EntityDsIdentifier, model: ModelDsIdentifier) => UiAttribute | null;

  getAttributeProfile: (identifier: EntityDsIdentifier, model: ModelDsIdentifier) => UiAttributeProfile | null;

  getAssociation: (identifier: EntityDsIdentifier, model: ModelDsIdentifier) => UiAssociation | null;

  getAssociationProfile: (identifier: EntityDsIdentifier, model: ModelDsIdentifier) => UiAssociationProfile | null;

  //

  onAddEntityModels: (visualModel: VisualModel, models: EntityModel[]) => void;

  onRemoveEntityModel: (removed: string[]) => void;

  onChangeVisualModel: (model: ModelDsIdentifier, color: HexColor) => void;

  onAddVisualEntity: (model: ModelDsIdentifier, entity: EntityDsIdentifier, visual: string) => void;

  onRemoveVisualEntity: (model: ModelDsIdentifier, entity: EntityDsIdentifier) => void;

}

const apiContext = React.createContext<UiModelApiContext>({
  getClass: () => null,
  getClassProfile: () => null,
  getAttribute: () => null,
  getAttributeProfile: () => null,
  getAssociation: () => null,
  getAssociationProfile: () => null,
  //
  onAddEntityModels: () => null,
  onRemoveEntityModel: () => null,
  onChangeVisualModel: () => null,
  onAddVisualEntity: () => null,
  onRemoveVisualEntity: () => null,
});

export const WithUiModel = (props: {
  children: React.ReactNode,
  aggregatorView: SemanticModelAggregatorView,
}) => {
  // We store data using reference as well as the state.
  // This allows to trigger re-render and provide on-demand access.
  const stateRef = useRef<UiModelStateContext>({
    ...createEmptyUiState(),
    defaultWriteModel: null,
  });
  const [state, setState] = useState<UiModelStateContext>(stateRef.current);

  useEffect(() => {
    // This method is called three times when page is loaded in developer mode.
    // First time with no content.
    // Second time empty with adding new content using the listener.
    // Third time with all the content ready.
    const initialState = initializeState(
      props.aggregatorView,
      props.aggregatorView.getActiveVisualModel(),
      configuration().languagePreferences);
    stateRef.current = initialState;
    setState(initialState);

    // Register for event updates.
    const unregister = props.aggregatorView.subscribeToChanges((updated: AggregatedEntityWrapper[], removed: string[]) => {
      setState(previous => {
        const nextState = onChangeSemanticModel(
          [],
          props.aggregatorView.getActiveVisualModel(),
          configuration().languagePreferences,
          previous,
          updated,
          removed,
        );
        stateRef.current = nextState;
        return nextState;
      });
    });

    // Unregister when aggregator view change.
    return () => {
      unregister();
    };

  }, [setState, props.aggregatorView]);

  const getterContent = useMemo<UiModelApiContext>(() => ({
    getClass: (identifier, model) =>
      findEntity(stateRef.current.classes, identifier, model),
    getClassProfile: (identifier, model) =>
      findEntity(stateRef.current.classProfiles, identifier, model),
    getAttribute: (identifier, model) =>
      findEntity(stateRef.current.attributes, identifier, model),
    getAttributeProfile: (identifier, model) =>
      findEntity(stateRef.current.attributeProfiles, identifier, model),
    getAssociation: (identifier, model) =>
      findEntity(stateRef.current.associations, identifier, model),
    getAssociationProfile: (identifier, model) =>
      findEntity(stateRef.current.associationProfiles, identifier, model),
    onAddEntityModels: (visualModel, models) => {
      const next = onAddEntityModels(stateRef.current, visualModel, models);
      stateRef.current = next;
      setState(next);
    },
    onRemoveEntityModel: (removed) => {
      const next = onRemoveEntityModel(stateRef.current, removed);
      stateRef.current = next;
      setState(next);
    },
    onChangeVisualModel: (model, color) => {
      const next = onChangeVisualModel(stateRef.current, model, color);
      stateRef.current = next;
      setState(next);
    },
    onAddVisualEntity: (model, entity, visual) => {
      const next = onAddVisualEntity(stateRef.current, model, entity, visual);
      stateRef.current = next;
      setState(next);
    },
    onRemoveVisualEntity: (model, entity) => {
      const next = onRemoveVisualEntity(stateRef.current, model, entity);
      stateRef.current = next;
      setState(next);
    },
  }), [setState, stateRef]);

  return (
    <context.Provider value={state}>
      <apiContext.Provider value={getterContent}>
        {props.children}
      </apiContext.Provider>
    </context.Provider>
  );
};

function findEntity<T extends {
  dsIdentifier: EntityDsIdentifier,
  model: { dsIdentifier: ModelDsIdentifier },
}>(
  entities: T[],
  identifier: EntityDsIdentifier,
  model: ModelDsIdentifier,
): T | null {
  return entities.find(item => item.dsIdentifier === identifier && item.model.dsIdentifier === model) ?? null;
}

export const useUiModel = (): UiModelStateContext => {
  return useContext(context);
};

export const useUiModelApi = (): UiModelApiContext => {
  return useContext(apiContext);
};
