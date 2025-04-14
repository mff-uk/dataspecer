import {CoreResource} from "../../core/index.ts";

/**
 * {@link CoreResource} that support extensions object that adds properties
 * specific to given serialization technology.
 */
export class ExtendableCoreResource extends CoreResource {
  extensions?: { string: object }
}
