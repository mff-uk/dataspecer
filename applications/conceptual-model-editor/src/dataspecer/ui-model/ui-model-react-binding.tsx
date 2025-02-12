import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import { EntityModel } from "@dataspecer/core-v2";
import { VisualModel } from "@dataspecer/core-v2/visual-model";
import { SemanticModelAggregatorView } from "@dataspecer/core-v2/semantic-model/aggregator";

import { createEmptyState, createState } from "./ui-model-state";
import { createUiModelApi, UiModelApi } from "./ui-model-api";
import { UiModelState } from "./ui-model";
import { configuration } from "../../application";

const context = React.createContext<UiModelState>(createEmptyState());

const apiContext = React.createContext<UiModelApi>(null as any);

export const UiModelProvider = (props: {
  children: React.ReactNode,
  semanticModels: EntityModel[],
  activeVisualModel: VisualModel | null,
  aggregatorView: SemanticModelAggregatorView,
}) => {
  // We store data using reference as well as the state.
  // This allows to trigger re-render and provide on-demand access.
  const stateRef = useRef<UiModelState>(createEmptyState());
  const [state, setStateState] = useState<UiModelState>(stateRef.current);

  // We need to keep state and ref synched.
  const setState = useCallback((next: UiModelState) => {
    stateRef.current = next;
    setStateState(next);
  }, [setStateState]);

  const { semanticModels, activeVisualModel, aggregatorView } = props;

  useEffect(() => {
    const nextState = createState(
      semanticModels, activeVisualModel, aggregatorView,
      configuration().languagePreferences);
    setState(nextState);

    const unsubscribe = aggregatorView.subscribeToChanges((updated, removed) => {
      console.log("Change in aggregator view.", { updated, removed });
    });

    // If there is a change, we need to unsubscribe.
    return () => {
      unsubscribe();
    };
  }, [aggregatorView, semanticModels, activeVisualModel, setState]);

  /*
  UseEffect(() => {
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

  const api = useMemo<UiModelApi>(() => {
    return createUiModelApi(() => stateRef.current);
  }, [setState, stateRef]);

  return (
    <>
      <context.Provider value={state}>
        <apiContext.Provider value={api}>
          {props.children}
        </apiContext.Provider>
      </context.Provider>
    </>
  );
};
/*
Function findEntity<T extends {
  dsIdentifier: EntityDsIdentifier,
  model: { dsIdentifier: ModelDsIdentifier },
}>(
  entities: T[],
  identifier: EntityDsIdentifier,
  model: ModelDsIdentifier,
): T | null {
  return entities.find(item => item.dsIdentifier === identifier && item.model.dsIdentifier === model) ?? null;
}
*/
export const useUiModel = (): UiModelState => {
  return useContext(context);
};

export const useUiModelApi = (): UiModelApi => {
  return useContext(apiContext);
};
