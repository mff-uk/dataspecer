import React, { useContext, useMemo, useState } from "react";

/**
 * Highlighting exploration interface
 */
export interface ExplorationContext {
  /**
   * Tells us if the exploration mode is on.
   */
  isHighlightingOn: boolean;
  /**
   * Turns on/off the exploration mode
   */
  toggleHighlighting: () => void;

  /**
   * Is the map which maps visual identifier of node to its highlight level
   */
  highlightLevels: Record<string, number>;

  /**
   * Is used to set the {@link highlightLevels}
   */
  setHighlightLevels: React.Dispatch<React.SetStateAction<Record<string, number>>>;

  /**
   * Maps semantic identifiers of nodes to their visual ones. This is here for optimization.
   */
  semanticToVisualIdentifierMap: Record<string, string>;

  /**
   * Sets he {@link semanticToVisualIdentifierMap}
   */
  setSemanticToVisualIdentifierMap: React.Dispatch<React.SetStateAction<Record<string, string>>>;

  /**
   * Extra variable, which can disable the highlighting, it is again used for performace,
   * since sometimes we want to say that we don't want to react to actions causing highlighting
   */
  isHighlightingInternallyOn: boolean;

  /**
   * Sets the {@link isHighlightingInternallyOn}
   */
  setIsHighlightingInternallyOn: React.Dispatch<React.SetStateAction<boolean>>;

  /**
   * Sometimes we want to shrink the catalog and sometimes not, for example when the highlighting
   * comes from catalog, then we don't want to shrink since it would break everything
   */
  shouldShrinkCatalog: boolean;

  /**
   * Sets the {@link shouldShrinkCatalog}
   */
  setShouldShrinkCatalog: React.Dispatch<React.SetStateAction<boolean>>;
}

const ExplorationContext = React.createContext<ExplorationContext>(null as any);

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

interface UseExplorationContext extends
  Omit<ExplorationContext, "setIsHighlightingInternallyOn" | "isHighlightingInternallyOn"> {

  /**
   * Resets the highlighting levels.
   */
  resetHighlight: () => void;

  /**
   * Disables the exploration temporarily, but it is still on.
   */
  disableTemporarily: () => void;

  /**
   * Enables the exploration, so if it is on, it reacts properly.
   */
  enableTemporarily: () => void;

  /**
   * @returns Returns true if any entity is highlighted
   */
  isHighlightingPresent: () => boolean;

  /**
   * @returns Returns true if both highlighting is on and it is internally allowed
   */
  isHighlightingChangeAllowed: () => boolean;
}

export const useExploration = (): UseExplorationContext => {
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
