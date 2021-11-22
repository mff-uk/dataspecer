/**
 * General model used for specification tools, the idea is that
 * the specification tools (ReSpec, Bikeshed, ..) should be able to express
 * this information.
 */
import {WebSpecificationConceptual} from "./web-specification-conceptual";
import {WebSpecificationStructure} from "./web-specification-structure";

export class WebSpecification {

  humanLabel: string | null;

  humanDescription: string | null;

  conceptual: WebSpecificationConceptual = new WebSpecificationConceptual();

  structures: WebSpecificationStructure[] = [];

}
