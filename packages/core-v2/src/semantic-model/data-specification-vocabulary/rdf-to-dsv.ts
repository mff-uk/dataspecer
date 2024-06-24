import * as N3 from "n3";
import { DataFactory } from "n3";

import {
  LanguageString,
  ConceptualModel,
  Profile,
  ClassProfile,
  PropertyProfile,
  ObjectPropertyProfile,
  isObjectPropertyProfile,
  DatatypePropertyProfile,
  isDatatypePropertyProfile,
  Cardinality,
} from "./dsv-model";

export async function rdfToconceptualModel(turtleAsString: string): Promise<ConceptualModel> {
  const conceptualModel: ConceptualModel = {
    iri: "",
    profiles: [],
  };
  return conceptualModel;
}
