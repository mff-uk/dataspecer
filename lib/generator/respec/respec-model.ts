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

  // TODO This contains a diagram .. we do not have one yet.

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

  relativeLink: string;

  /**
   * List of class members.
   */
  properties: ReSpecProperty[] = [];

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

  relativeLink: string;

}

export class ReSpecTypeReference {

  isPrimitive: boolean;

  label: string;

  schemaLink: string;

  relativeLink: string;

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
