export type { EntityListContainer } from "./entity-model";

// Conversion from list of Semantic entities to DSV and back.
export { createContext, entityListContainerToDsvModel as entityListContainerToConceptualModel } from "./entity-model-to-dsv";
export { conceptualModelToEntityListContainer } from "./dsv-to-entity-model";

// Conversion to and from RDF.
export { conceptualModelToRdf } from "./dsv-to-rdf";
export { rdfToConceptualModel } from "./rdf-to-dsv";
