import { CatalogState } from "./catalog-state";
import {
  modelsLayout,
  classesLayout,
  associationsLayout,
  attributesLayout,
  profilesLayout,
  generalizationsLayout,
} from "./layout";

export const createDefaultCatalogState = (): CatalogState => {
  const layouts = [
    modelsLayout,
    classesLayout,
    associationsLayout,
    attributesLayout,
    profilesLayout,
    generalizationsLayout,
  ];
  const defaultLayoutIdentifier = "";
  const layout = layouts
    .find(item => item.identifier === defaultLayoutIdentifier)
    ?? layouts[0];
  return {
    layout,
    availableLayouts: layouts,
    items: [],
    availableLayoutItems: layouts.map(() => []),
    search: "",
  };
}
