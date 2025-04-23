import { UiCardinality } from "./model";

export const uiCardinalityToString = (cardinality: UiCardinality | null): string | null => {
  if (cardinality === null || cardinality === undefined) {
    return null;
  }
  return `[${cardinality[0] ?? "*"}..${cardinality[1] ?? "*"}]`;
};
