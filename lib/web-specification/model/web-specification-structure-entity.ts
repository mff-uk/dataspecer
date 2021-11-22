import {
  WebSpecificationStructureProperty,
} from "./web-specification-structure-property";
import {
  WebSpecificationConceptualEntity
} from "./web-specification-conceptual-entity";

export class WebSpecificationStructureEntity {

  technicalLabel: string | null = null;

  humanLabel: string | null = null;

  humanDescription: string | null = null;

  anchor: string | null = null;

  properties: WebSpecificationStructureProperty[] = [];

  conceptualEntity: WebSpecificationConceptualEntity | null = null;

}
