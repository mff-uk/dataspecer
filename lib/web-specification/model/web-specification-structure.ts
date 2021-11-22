import {
  WebSpecificationStructureEntity
} from "./web-specification-structure-entity";
import {
  WebSpecificationStructureAttachment,
} from "./web-specification-structure-attachment";

/**
 * Particular schema represents for a specific format.
 */
export class WebSpecificationStructure {

  humanLabel: string | null;

  humanDescription: string | null;

  anchor: string | null;

  entities: WebSpecificationStructureEntity[] = [];

  /**
   * Examples to render.
   */
  attachments: WebSpecificationStructureAttachment [] = [];

}
