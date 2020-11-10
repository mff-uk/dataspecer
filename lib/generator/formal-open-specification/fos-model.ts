export class FormalOpenSpecification {

  metadata: FosMetadata;

  overview: FosOverview;

  specification: FosSpecification;

  examples: FosExample[];

  references: FosReference;

}

export class FosMetadata {

  title: string;

}

export class FosOverview {

  // TODO This contains a diagram .. we do not have one yet.

}

export class FosSpecification {

  /**
   * List of entities in the section.
   */
  entities: FosEntity[];

}

export class FosEntity {

  humanLabel: string;

  humanDescription: string;

  /**
   * List of class members.
   */
  properties: FosProperty[];

}

export enum FosPropertyType {
  Attribute = "Attribute",
  Association = "Association"
}

export class FosProperty {

  propertyType: FosPropertyType;

  /**
   * Name of the attribute inside the model.
   */
  technicalLabel: string;

  /**
   * If provided the type is a link with this as a name and
   * {@link typeValue} as a href.
   */
  typeLabel: string;

  typeValue: string;

  /**
   * Human readable title.
   */
  humanLabel: string;

  description: string;

  examples: string[];

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
  attachments: Record<string, string>;
}

export class FosReference {

}
