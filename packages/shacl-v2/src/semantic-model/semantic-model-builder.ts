import { Entities, Entity } from "@dataspecer/core-v2";
import {
  SEMANTIC_MODEL_CLASS,
  SemanticModelClass,
  SemanticModelGeneralization,
  SemanticModelRelationship,
  SemanticModel,
  SEMANTIC_MODEL_RELATIONSHIP,
  SemanticModelRelationshipEnd,
} from "./semantic-model.ts";

type LanguageString = { [language: string]: string };

interface SemanticModelProperty {

  iri: string;

  name: LanguageString;

  externalDocumentationUrl: string | null;

}

export interface SemanticModelBuilder {

  class(
    value?: Partial<SemanticModelClass>,
  ): SemanticClassBuilder;

  relationship(
    value?: Partial<SemanticModelRelationship>,
  ): SemanticRelationshipBuilder;

  property(
    value?: Partial<SemanticModelProperty>,
  ): SemanticRelationshipBuilder;

  generalization(
    value?: Partial<SemanticModelGeneralization>,
  ): SemanticGeneralizationBuilder;

  build(): SemanticModel;

}

interface Identifiable {

  identifier: string;

}

export interface SemanticClassBuilder extends Identifiable {

}

export interface SemanticRelationshipBuilder extends Identifiable {

  domain(value: SemanticClassBuilder): SemanticRelationshipBuilder;

  range(value: SemanticClassBuilder): SemanticRelationshipBuilder;

}

export interface SemanticGeneralizationBuilder extends Identifiable {

  generalization<
    Type extends SemanticClassBuilder | SemanticRelationshipBuilder
  >(
    parent: Type,
    child: Type,
  ): SemanticRelationshipBuilder;

}

class DefaultSemanticModelBuilder implements SemanticModelBuilder {

  counter: number = 0;

  readonly baseUrl: string;

  readonly entities: Record<string, Entity>;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.entities = {};
  }

  class(value?: Partial<SemanticModelClass>): SemanticClassBuilder {
    const identifier = this.nextIdentifier();
    const entity: SemanticModelClass = {
      // Entity
      id: identifier,
      type: [SEMANTIC_MODEL_CLASS],
      // NamedThing
      name: {},
      description: {},
      // SemanticModelClass
      externalDocumentationUrl: undefined,
      ...value,
      // SemanticModelEntity
      iri: this.baseUrl + (value?.iri ?? `class#${this.counter}`),
    };
    this.entities[identifier] = entity;
    return new DefaultSemanticClassBuilder(entity);
  }

  nextIdentifier() {
    ++this.counter;
    return this.baseUrl + "000-" + String(this.counter).padStart(3, "0");
  }

  relationship(
    value?: Partial<SemanticModelRelationship>,
  ): SemanticRelationshipBuilder {
    throw new Error("Method not implemented.");
  }

  property(
    value?: Partial<SemanticModelProperty>,
  ): SemanticRelationshipBuilder {
    const identifier = this.nextIdentifier();
    const entity: SemanticModelRelationship = {
      // Entity
      id: identifier,
      type: [SEMANTIC_MODEL_RELATIONSHIP],
      // NamedThing
      name: {},
      description: {},
      // SemanticModelEntity
      iri: null,
      ends: [{
        iri: null,
        cardinality: undefined,
        concept: null,
        externalDocumentationUrl: null,
        name: {},
        description: {},
      }, {
        iri: this.baseUrl + (value?.iri ?? `relationship#${this.counter}`),
        cardinality: undefined,
        concept: null,
        externalDocumentationUrl: value?.externalDocumentationUrl ?? null,
        name: value?.name ?? {},
        description: {},
      }],
    };
    this.entities[identifier] = entity;
    return new DefaultSemanticRelationshipBuilder(entity);
  }

  generalization(
    value?: Partial<SemanticModelGeneralization>,
  ): SemanticGeneralizationBuilder {
    throw new Error("Method not implemented.");
  }

  build(): SemanticModel {
    return new DefaultSemanticModel(this.entities);
  }

}

class DefaultSemanticClassBuilder implements SemanticClassBuilder {

  readonly identifier: string;

  constructor(entity: SemanticModelClass) {
    this.identifier = entity.id;
  }

}

class DefaultSemanticRelationshipBuilder
  implements SemanticRelationshipBuilder {

  readonly identifier: string;

  readonly entity: SemanticModelRelationship;

  readonly domainEnd: SemanticModelRelationshipEnd;

  readonly rangeEnd: SemanticModelRelationshipEnd;

  constructor(entity: SemanticModelRelationship) {
    this.identifier = entity.id;
    this.entity = entity;
    this.domainEnd = entity.ends[0];
    this.rangeEnd = entity.ends[1];
  }

  domain(value: SemanticClassBuilder): SemanticRelationshipBuilder {
    this.domainEnd.concept = value.identifier;
    return this;
  }

  range(value: SemanticClassBuilder): SemanticRelationshipBuilder {
    this.rangeEnd.concept = value.identifier;
    return this;
  }

}

class DefaultSemanticModel implements SemanticModel {

  entities: Record<string, Entity>;

  constructor(entities: Record<string, Entity>) {
    this.entities = entities;
  }

  getEntities(): Entities {
    return this.entities;
  }

  subscribeToChanges(): () => void {
    throw new Error("Method not implemented.");
  }

  getId(): string {
    throw new Error("Method not implemented.");
  }

  getAlias(): string | null {
    throw new Error("Method not implemented.");
  }

  setAlias(alias: string | null): void {
    throw new Error("Method not implemented.");
  }

}

export function createDefaultSemanticModelBuilder(
  baseUrl: string,
): SemanticModelBuilder {
  return new DefaultSemanticModelBuilder(baseUrl);
}
