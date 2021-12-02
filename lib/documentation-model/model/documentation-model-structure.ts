import {
  DocumentationModelStructureEntity
} from "./documentation-model-structure-entity";
import {
  DocumentationModelStructureAttachment,
} from "./documentation-model-structure-attachment";

/**
 * Particular schema represents for a specific format.
 */
export class DocumentationModelStructure {

  humanLabel: string | null;

  humanDescription: string | null;

  anchor: string | null;

  entities: DocumentationModelStructureEntity[] = [];

  /**
   * Examples to render.
   */
  attachments: DocumentationModelStructureAttachment [] = [];

}
