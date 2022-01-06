/**
 * General model used for specification tools, the idea is that
 * the specification tools (ReSpec, Bikeshed, ..) should be able to express
 * this information.
 */
import {DocumentationModelConceptual} from "./documentation-model-conceptual";
import {DocumentationModelStructure} from "./documentation-model-structure";

export class DocumentationModel {

  humanLabel: string | null;

  humanDescription: string | null;

  conceptual: DocumentationModelConceptual = new DocumentationModelConceptual();

  structures: DocumentationModelStructure[] = [];

}
