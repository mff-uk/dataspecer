import { useMemo } from "react";
import { type DialogProps } from "../dialog-api";

const PREDEFINED_MODELS: PredefinedModel[] = [{
  "identifier": "rdf",
  "label": "RDF - Resource Description Framework",
  "url": "https://datagov-cz.github.io/cache-slovniku/rdf.ttl",
}, {
  "identifier": "rdfs",
  "label": "RDFS - RDF Schema",
  "url": "https://datagov-cz.github.io/cache-slovniku/rdfs.ttl",
}, {
  "identifier": "dcterms",
  "label": "DCMI Metadata Terms",
  "url": "https://www.dublincore.org/specifications/dublin-core/dcmi-terms/dublin_core_terms.ttl",
}, {
  "identifier": "foaf",
  "label": "FOAF (Friend of a Friend) Vocabulary",
  "url": "https://datagov-cz.github.io/cache-slovniku/foaf.ttl",
}, {
  "identifier": "skos",
  "label": "SKOS Simple Knowledge Organization System",
  "url": "https://datagov-cz.github.io/cache-slovniku/skos.rdf",
}, {
  "identifier": "owl",
  "label": "OWL 2 - Web Ontology Language",
  "url": "https://www.w3.org/2002/07/owl#",
}, {
  "identifier": "dcat",
  "label": "DCAT - Data Catalog Vocabulary",
  "url": "https://www.w3.org/ns/dcat.ttl",
}, {
  "identifier": "sgov",
  "label": "Czech Semantic Dictionary of terms",
  "alias": "SGOV",
}];

/**
 * Represent a model that can be added from a list.
 */
export interface PredefinedModel {

  /**
   * Model identifier.
   */
  identifier: string;

  /**
   * Human visible label in the model list.
   */
  label: string;

  /**
   * Optional value used as an alias for the model.
   * If missing label is used instead.
   */
  alias?: string;

  /**
   * Optional URL to add model from.
   */
  url?: string;

}

export enum TabType {
  AddFromUrl = 0,
  AddPredefined = 1,
  CreateLocal = 2
}

export interface CreateModelState {

  activeTab: TabType;

  // "AddFromUrl" and "CreateLocal".

  modelUrl: string;

  modelAlias: string;

  // "AddPredefined".

  predefinedModels: PredefinedModel[];

  selectedModels: PredefinedModel[];

}

const DEFAULT_URL = "https://www.w3.org/ns/dcat.ttl";

const DEFAULT_ALIAS = "dcat";

export function createCreateModelState(): CreateModelState {
  return {
    activeTab: TabType.AddPredefined,
    modelUrl: DEFAULT_URL,
    modelAlias: DEFAULT_ALIAS,
    predefinedModels: [...PREDEFINED_MODELS],
    selectedModels: [],
  };
}

export interface CreateModelControllerType {

  setActiveTab: (next: TabType) => void;

  setModelUrl: (next: string) => void;

  setModelAlias: (next: string) => void;

  toggleSelection: (model: PredefinedModel) => void;

}

export function useCreateModelController({ state, changeState }: DialogProps<CreateModelState>): CreateModelControllerType {
  return useMemo(() => {

    const setActiveTab = (next: TabType) => {
      changeState({ ...state, activeTab: next });
    };

    const setModelUrl = (next: string) => {
      changeState({ ...state, modelUrl: next });
    };

    const setModelAlias = (next: string) => {
      changeState({ ...state, modelAlias: next });
    };

    const toggleSelection = (model: PredefinedModel) => {
      const index = state.selectedModels.indexOf(model);
      if (index === -1) {
        changeState({ ...state, selectedModels: [...state.selectedModels, model] });
      } else {
        changeState({ ...state, selectedModels: [...state.selectedModels.slice(0, index), ...state.selectedModels.slice(index + 1)] });
      }
    };

    return {
      setActiveTab,
      setModelUrl,
      setModelAlias,
      toggleSelection,
    };
  }, [state, changeState]);
}
