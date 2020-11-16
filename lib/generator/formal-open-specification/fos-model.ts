export class FormalOpenSpecification {

  url: string;

  metadata: FosMetadata = new FosMetadata();

  overview: FosOverview = new FosOverview();

  specification: FosSpecification = new FosSpecification();

  examples: FosExample[] = [];

  references: FosReference = new FosReference();

}

export class FosMetadata {

  title: string | undefined = undefined;

}

export class FosOverview {

  // TODO This contains a diagram .. we do not have one yet.

}

export class FosSpecification {

  /**
   * List of entities in the section.
   */
  entities: FosEntity[] = [];

}

export class FosEntity {

  humanLabel: string;

  humanDescription: string;

  relativeLink: string;

  /**
   * List of class members.
   */
  properties: FosProperty[] = [];

}

export class FosProperty {

  type: FosTypeReference[] = [];

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

  relativeLink: string;

}

export class FosTypeReference {

  isPrimitive: boolean;

  label: string;

  schemaLink: string;

  relativeLink: string;

}

export class FosExample {

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

export class FosReference {

  // TODO It seems there is no content that should change with data.

}
