import { CoreResource } from "../../core";
import { PimResource } from "./pim-resource";
import * as PIM from "../pim-vocabulary";

/**
 * An attribute is a primitive property that belongs to a class. It may be
 * a string, integer etc.
 */
export class PimAttribute extends PimResource {
  static readonly TYPE = PIM.ATTRIBUTE;

  pimDatatype: string | null = null;

  // If pimDataType is languageString, then this is the list of required languages
  pimLanguageStringRequiredLanguages: string[] = [];

  pimOwnerClass: string | null = null;

  pimCardinalityMin: number | null = null;

  pimCardinalityMax: number | null = null;

  pimRegex: string | null = null;

  pimExample: string[] | null = null;

  constructor(iri: string | null = null) {
    super(iri);
    this.types.push(PimAttribute.TYPE);
  }

  static is(resource: CoreResource | null): resource is PimAttribute {
    return resource?.types.includes(PimAttribute.TYPE);
  }
}
