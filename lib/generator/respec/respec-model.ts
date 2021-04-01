export class ReSpec {

  metadata: ReSpecMetadata = new ReSpecMetadata();

  overview: ReSpecOverview = new ReSpecOverview();

  specification: ReSpecSpecification = new ReSpecSpecification();

  examples: ReSpecExample[] = [];

  references: ReSpecReference = new ReSpecReference();

}

export class ReSpecMetadata {

  title: string | undefined = undefined;

}

export class ReSpecOverview {

  humanDescription: string;

}

export class ReSpecSpecification {

  /**
   * List of entities in the section.
   */
  entities: ReSpecEntity[] = [];

}

export class ReSpecEntity {

  humanLabel: string;

  humanDescription: string;

  /**
   * Identification of section
   */
  identification: string;

  /**
   * List of class members.
   */
  properties: ReSpecProperty[] = [];

  isCodelist: boolean;

}

export class ReSpecProperty {

  type: ReSpecTypeReference[] = [];

  /**
   * Name of the attribute inside the model.
   */
  technicalLabel: string;

  /**
   * Human readable title.
   */
  humanLabel: string;

  humanDescription: string;

  examples: string[] = [];

  /**
   * Identification of section
   */
  identification: string;

}

export class ReSpecTypeReference {

  isPrimitive: boolean;

  label: string;

  link: string | undefined;

  /**
   * If given values for this reference should be part of the codelist,
   * this item contains CIM IRI of entity that is codelist item.
   */
  codelist: string | undefined;

  /**
   * If true the value of this property is instance of given class, but
   * without any properties.
   */
  isClassValue: boolean | unknown;

}

export class ReSpecExample {

  title: string;

  description: string;

  /**
   * Title of the visible example.
   */
  fileTitle: string;

  /**
   * Content of the visible example.
   */
  fileContent: string;

  /**
   * External files like JSON-LD context, JSON schema etc ...
   */
  attachments: Record<string, string> = {};

}

export class ReSpecReference {

  // TODO It seems there is no content that should change with data.

}
