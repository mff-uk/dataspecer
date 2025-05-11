import React, { useContext, useMemo, useState } from "react";

/**
 * Highlighting exploration interface
 */
export interface Exploration {
  isHighlightingOn: boolean;
  toggleHighlighting: () => void;
  //
  highlightLevels: Record<string, number>;
  setHighlightLevels: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  //
  semanticToVisualIdentifierMap: Record<string, string>;
  setSemanticToVisualIdentifierMap: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  //
  isHighlightingInternallyOn: boolean;
  setIsHighlightingInternallyOn: React.Dispatch<React.SetStateAction<boolean>>;
  //
  shouldShrinkCatalog: boolean;
  setShouldShrinkCatalog: React.Dispatch<React.SetStateAction<boolean>>;
}

const ExplorationContext = React.createContext<Exploration>(null as any);

export const ExplorationContextProvider = (props: { children: React.ReactNode }) => {
  const [isHighlightingOn, setIsHighlightingOn] = useState(false);
  const [highlightLevels, setHighlightLevels] = useState<Record<string, number>>({});
  const [isHighlightingInternallyOn, setIsHighlightingInternallyOn] = useState<boolean>(true);
  const [semanticToVisualIdentifierMap, setSemanticToVisualIdentifierMap] = useState<Record<string, string>>({});
  const [shouldShrinkCatalog, setShouldShrinkCatalog] = useState<boolean>(false);

  const context = useMemo(() => {
    return {
      isHighlightingOn,
      toggleHighlighting: () => setIsHighlightingOn(prev => !prev),

      highlightLevels,
      setHighlightLevels,

      semanticToVisualIdentifierMap,
      setSemanticToVisualIdentifierMap,

      isHighlightingInternallyOn,
      setIsHighlightingInternallyOn,

      shouldShrinkCatalog,
      setShouldShrinkCatalog
    };
  }, [
    isHighlightingOn, setIsHighlightingOn, highlightLevels, setHighlightLevels,
    isHighlightingInternallyOn, setIsHighlightingInternallyOn,
    semanticToVisualIdentifierMap, setSemanticToVisualIdentifierMap,
    shouldShrinkCatalog, setShouldShrinkCatalog
  ]);

  return (
    <ExplorationContext.Provider value={context}>
      {props.children}
    </ExplorationContext.Provider>
  );
};

export const useExploration = () => {
  const {
    highlightLevels,
    setHighlightLevels,
    semanticToVisualIdentifierMap,
    setSemanticToVisualIdentifierMap,
    isHighlightingInternallyOn,
    setIsHighlightingInternallyOn,
    isHighlightingOn,
    toggleHighlighting,
    shouldShrinkCatalog,
    setShouldShrinkCatalog,
  } = useContext(ExplorationContext);

  const resetHighlight = () => {
    if(!isHighlightingChangeAllowed()) {
      return;
    }

    setHighlightLevels({});
  };

  const disableTemporarily = () => {
    if (!isHighlightingInternallyOn) {
      return;
    }

    setIsHighlightingInternallyOn(false);
  };

  const enableTemporarily = () => {
    if (isHighlightingInternallyOn) {
      return;
    }

    setIsHighlightingInternallyOn(true);
  };

  const isHighlightingPresent = () => {
    return isHighlightingChangeAllowed() && Object.keys(highlightLevels).length !== 0;
  };

  const isHighlightingChangeAllowed = () => {
    return isHighlightingOn && isHighlightingInternallyOn;
  }

  return {
    highlightLevels, resetHighlight,
    disableTemporarily, enableTemporarily,
    isHighlightingPresent,
    toggleHighlighting,
    isHighlightingChangeAllowed,
    semanticToVisualIdentifierMap,
    setSemanticToVisualIdentifierMap,
    shouldShrinkCatalog,
    setShouldShrinkCatalog,
    isHighlightingOn,
    setHighlightLevels
  };
}
