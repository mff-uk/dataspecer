export type { EntityListContainer } from "./entity-model.ts";

// Conversion from list of Semantic entities to DSV and back.
export { createContext, entityListContainerToDsvModel as entityListContainerToConceptualModel } from "./entity-model-to-dsv.ts";
export { conceptualModelToEntityListContainer } from "./dsv-to-entity-model.ts";

// Conversion to and from RDF.
export { conceptualModelToRdf } from "./dsv-to-rdf.ts";
export { rdfToConceptualModel } from "./rdf-to-dsv.ts";
