/**
 * General model used for specification tools, the idea is that
 * the specification tools (ReSpec, Bikeshed) should be able to express
 * same information.
 */
export class WebSpecification {

  humanLabel: string | null;

  humanDescription: string | null;

  schemas: WebSpecificationSchema = new WebSpecificationSchema();

}

export class WebSpecificationSchema {

  entities: WebSpecificationEntity[] = [];

}

export class WebSpecificationEntity {

  humanLabel: string | null;

  humanDescription: string | null;

  anchor: string | null;

  classIri: string | null;

  isCodelist: boolean;

  properties: WebSpecificationProperty[] = [];

}

export class WebSpecificationProperty {

  technicalLabel: string | null;

  humanLabel: string | null;

  humanDescription: string | null;

  anchor: string | null;

  type: WebSpecificationType[] = [];

}

export class WebSpecificationType {

  label: string | null;

  isPrimitive: boolean;

  /**
   * If true the value of this property is instance of given class, but
   * without any properties.
   */
  isClassValue: boolean;

  /**
   * Optional link to a type definition.
   */
  link: string | null;

  /**
   * IRI of a codelist if the value is from one.
   */
  codelistIri: string | null;

}
