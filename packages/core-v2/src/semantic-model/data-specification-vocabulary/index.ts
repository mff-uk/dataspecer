export type { EntityListContainer } from "./entity-model";

// Converstion from list of Semantic entities to DSV and back.
export { createContext, entityListContainerToConceptualModel } from "./entity-model-to-dsv";
export { conceptualModelToEntityListContainer } from "./dsv-to-entity-model";

// Conversion to and from RDF Turtle.
export { conceptualModelToRdf } from "./dsv-to-rdf";
export { rdfToconceptualModel } from "./rdf-to-dsv";

