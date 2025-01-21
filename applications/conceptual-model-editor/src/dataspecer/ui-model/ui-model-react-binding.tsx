import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import { EntityModel } from "@dataspecer/core-v2";
import { HexColor, VisualModel } from "@dataspecer/core-v2/visual-model";
import { AggregatedEntityWrapper, SemanticModelAggregatorView } from "@dataspecer/core-v2/semantic-model/aggregator";

import { createEmptyState, onAddEntityModels, onAddVisualEntity, onChangeVisualModel, onRemoveEntityModel, onRemoveVisualEntity } from "./ui-model-state";
import { EntityDsIdentifier, ModelDsIdentifier } from "../entity-model";
import { UiModelApi } from "./ui-model-api";
import { UiState } from "./ui-model";

const uiModelContext = React.createContext<UiState>(createEmptyState());

const apiContext = React.createContext<UiModelApi>(null as any);

export const UiModelProvider = (props: {
  children: React.ReactNode,
  semanticModels: EntityModel[],
  visualModel: VisualModel | null,
  aggregatorView: SemanticModelAggregatorView,
}) => {
  // We store data using reference as well as the state.
  // This allows to trigger re-render and provide on-demand access.
  const stateRef = useRef<UiState>(createEmptyState());
  const [state, setStateState] = useState<UiState>(stateRef.current);

  // We need to keep state and ref synched.
  const setState = useCallback((next: UiState) => {
    stateRef.current = next;
    setStateState(next);
  }, [setStateState]);

  const { semanticModels, visualModel, aggregatorView } = props;

  useEffect(() => {
    // Initial state ...
    console.log("UiModelProvider change");
  }, [aggregatorView, semanticModels, visualModel, setState]);

  /*
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
  */

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

export const useUiModel = (): UiState => {
  return useContext(context);
};

export const useUiModelApi = (): UiModelApiContext => {
  return useContext(apiContext);
};
