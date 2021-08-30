/**
 * General model used for specification tools, the idea is that
 * the specification tools (ReSpec, Bikeshed) should be able to express
 * same information.
 */
export class WebSpecification {

  humanLabel: string;

  humanDescription: string;

  schemas: WebSpecificationSchema = new WebSpecificationSchema();

}

export class WebSpecificationSchema {

  entities: WebSpecificationEntity[] = [];

}

export class WebSpecificationEntity {

  humanLabel: string;

  humanDescription: string;

  anchor: string;

  classIri: string;

  isCodelist: boolean;

  properties: WebSpecificationProperty[] = [];

}

export class WebSpecificationProperty {

  technicalLabel: string;

  humanLabel: string;

  humanDescription: string;

  anchor: string;

  type: WebSpecificationType[] = [];

}

export class WebSpecificationType {

  label: string;

  isPrimitive: boolean;

  /**
   * If true the value of this property is instance of given class, but
   * without any properties.
   */
  isClassValue: boolean;

  /**
   * Optional link to a type definition.
   */
  link: string | undefined;

  /**
   * IRI of a codelist if the value is from one.
   */
  codelistIri: string | undefined;

}
