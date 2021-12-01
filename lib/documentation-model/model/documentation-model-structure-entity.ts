import {
  DocumentationModelStructureProperty,
} from "./documentation-model-structure-property";
import {
  DocumentationModelConceptualEntity
} from "./documentation-model-conceptual-entity";

export class DocumentationModelStructureEntity {

  technicalLabel: string | null = null;

  humanLabel: string | null = null;

  humanDescription: string | null = null;

  anchor: string | null = null;

  properties: DocumentationModelStructureProperty[] = [];

  conceptualEntity: DocumentationModelConceptualEntity | null = null;

}
