/**
 * We allow only one value for each language.
 */
export type LanguageString = Record<string, string>;

/**
 * Model base class.
 * We do not store order as our items are ordered and order is
 * not actually stored in the resource.
 */
export class ModelResource {

  readonly types: ModelResourceType[] = [];

  readonly id: string;

  readonly rdfTypes: string[];

  constructor(id: string, rdfTypes:string[] = []) {
    this.id = id;
    this.rdfTypes = rdfTypes;
  }

}

export enum ModelResourceType {
  PimSchema = "pim-schema",
  PimClass = "pim-class",
  PimAttribute = "pim-attribute",
  PimAssociation = "pim-association",
  PsmSchema = "psm-schema",
  PsmClass = "psm-class",
  PsmPart = "psm-part",
}

export class PimSchema extends ModelResource {

  pimTitle: LanguageString = {};

  pimParts: string[] = [];

  static as(resource: ModelResource): PimSchema {
    if (resource.types.includes(ModelResourceType.PimSchema)) {
      return resource as PimSchema;
    }
    resource.types.push(ModelResourceType.PimSchema);
    const result = resource as PimSchema;
    result.pimTitle = result.pimTitle || {};
    result.pimParts = result.pimParts || [];
    return result;
  }

}

export class PimBase extends ModelResource {

  pimInterpretation?: string;

  pimTechnicalLabel?: string;

}

export class PimClass extends PimBase {

  static as(resource: ModelResource): PimClass {
    if (resource.types.includes(ModelResourceType.PimClass)) {
      return resource as PimSchema;
    }
    resource.types.push(ModelResourceType.PimClass);
    return resource as PimClass;
  }

}

export class PimAttribute extends PimBase {

  pimHasClass?: string;

  pimDatatype?: string;

  static as(resource: ModelResource): PimAttribute {
    if (resource.types.includes(ModelResourceType.PimAttribute)) {
      return resource as PimAttribute;
    }
    resource.types.push(ModelResourceType.PimAttribute);
    return resource as PimAttribute;
  }

}

export class PimAssociation extends PimBase {

  pimHasClass?: string;

  pimEnd: PimReference[] = [];

  static as(resource: ModelResource): PimAssociation {
    if (resource.types.includes(ModelResourceType.PimAssociation)) {
      return resource as PimAssociation;
    }
    resource.types.push(ModelResourceType.PimAssociation);
    const result = resource as PimAssociation;
    result.pimEnd = result.pimEnd || [];
    return result;
  }

}

export class PimReference {

  pimParticipant?: string;

}

export class PsmSchema extends ModelResource {

  psmTitle: LanguageString = {};

  psmRoots: string[] = [];

  psmOfn?: string;

  static as(resource: ModelResource): PsmSchema {
    if (resource.types.includes(ModelResourceType.PsmSchema)) {
      return resource as PsmSchema;
    }
    resource.types.push(ModelResourceType.PsmSchema);
    const result = resource as PsmSchema;
    result.psmTitle = result.psmTitle || {};
    result.psmRoots = result.psmRoots || [];
    return result;
  }

}

export class PsmBase extends ModelResource {

  psmInterpretation?: string;

  psmTechnicalLabel?: string;

  psmExtends: string[] = [];

  psmParts: string[] = [];

}

export class PsmClass extends PsmBase {

  static as(resource: ModelResource): PsmClass {
    if (resource.types.includes(ModelResourceType.PsmClass)) {
      return resource as PsmClass;
    }
    resource.types.push(ModelResourceType.PsmClass);
    const result = resource as PsmClass;
    result.psmExtends = result.psmExtends || [];
    result.psmParts = result.psmParts || [];
    return result;
  }

}

export class PsmPart extends PsmBase {

  /**
   * This part is one of those in choice.
   */
  psmChoice:string[] = [];

  static as(resource: ModelResource): PsmPart {
    if (resource.types.includes(ModelResourceType.PsmPart)) {
      return resource as PsmPart;
    }
    resource.types.push(ModelResourceType.PsmPart);
    const result = resource as PsmPart;
    result.psmExtends = result.psmExtends || [];
    result.psmParts = result.psmParts || [];
    result.psmChoice = result.psmChoice || [];
    return result;
  }

}
