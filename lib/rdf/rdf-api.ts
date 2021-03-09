//
// Allow user to read RDF resource and navigate between them.
// The API is focused on retrieving information about single resource.
//

export enum RdfValueType {
  BlankNode,
  NamedNode,
  Literal,
}

/**
 * Represents an RDF resource, later we can for example add caching
 * of properties, or request all properties in single query to save
 * some network traffic.
 */
export class RdfEntity {

  readonly id: string;

  protected constructor(id: string) {
    this.id = id;
  }

  static create(id: string): RdfEntity {
    return new RdfEntity(id);
  }

}

export class RdfBaseValue {

  private readonly valueType: RdfValueType;

  constructor(type: RdfValueType) {
    this.valueType = type;
  }

  isBlankNode(): this is RdfBlankNode {
    return this.valueType === RdfValueType.BlankNode;
  }

  isNamedNode(): this is RdfNamedNode {
    return this.valueType === RdfValueType.NamedNode;
  }

  isLiteral(): this is RdfLiteral {
    return this.valueType === RdfValueType.Literal;
  }

}

export class RdfBlankNode extends RdfBaseValue {

  readonly id: string;

  constructor(id: string) {
    super(RdfValueType.BlankNode);
    this.id = id;
  }

}

export class RdfNamedNode extends RdfBaseValue {

  readonly id: string;

  constructor(id: string) {
    super(RdfValueType.NamedNode);
    this.id = id;
  }

}

export class RdfLiteral extends RdfBaseValue {

  readonly value: string | number | boolean;

  readonly type: string;

  readonly language ?: string;

  constructor(
    value: string | number | boolean,
    type: string,
    language?: string,
  ) {
    super(RdfValueType.Literal);
    this.value = value;
    this.type = type;
    this.language = language;
  }

}
