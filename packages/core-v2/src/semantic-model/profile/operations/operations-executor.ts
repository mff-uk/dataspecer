import { Entity, EntityIdentifier } from "../../../entity-model/entity";
import { Operation } from "../../operations";
import { isSemanticModelClassProfile, isSemanticModelRelationshipProfile, SEMANTIC_MODEL_CLASS_PROFILE, SEMANTIC_MODEL_RELATIONSHIP_PROFILE, SemanticModelClassProfile, SemanticModelRelationshipEndProfile, SemanticModelRelationshipProfile, } from "../concepts";
import { CreateSemanticModelClassProfile, ModifySemanticModelClassProfile, CreateSemanticModelRelationshipProfile, ModifySemanticModelRelationshipProfile, isCreateSemanticModelClassProfile, isModifySemanticModelClassProfile, isCreateSemanticModelRelationshipProfile, isModifySemanticModelRelationshipProfile } from "./operations";

export interface IdentifierSource {

  /**
   * Create and return a new identifier;
   */
  createIdentifier(): EntityIdentifier;

}

export interface OperationResult {

  /**
   * True when operation has been successfully executed.
   */
  success: boolean;

  /**
   * Optional field contains identifiers of any created entities.
   */
  created: EntityIdentifier[];

}

export interface EntityReader {

  entity(identifier: EntityIdentifier): Entity | null;

}

export interface EntityWriter {

  change(updated: Record<EntityIdentifier, Entity>, removed: EntityIdentifier[]): void;

}

export interface SemanticModelProfileOperationExecutor {

  /**
   * Execute given operation and return results.
   *
   * @returns Null, if this executor does not know how to execute the operation.
   */
  executeOperation(operation: Operation): OperationResult | null;

}

class DefaultSemanticModelProfileOperationExecutor implements SemanticModelProfileOperationExecutor {

  private readonly identifierSource: IdentifierSource;

  private readonly entityReader: EntityReader;

  private readonly entityWriter: EntityWriter;

  public constructor(
    identifierSource: IdentifierSource,
    entityReader: EntityReader,
    entityWriter: EntityWriter,
  ) {
    this.identifierSource = identifierSource;
    this.entityReader = entityReader;
    this.entityWriter = entityWriter;
  }

  executeOperation(operation: Operation): OperationResult | null {
    if (isCreateSemanticModelClassProfile(operation)) {
      return executeCreateSemanticModelClassProfile(
        this.identifierSource, this.entityWriter, operation);
    }
    if (isModifySemanticModelClassProfile(operation)) {
      return executeModifySemanticModelClassProfile(
        this.entityReader, this.entityWriter, operation);
    }
    if (isCreateSemanticModelRelationshipProfile(operation)) {
      return executeCreateSemanticModelRelationshipProfile(
        this.identifierSource, this.entityWriter, operation);
    }
    if (isModifySemanticModelRelationshipProfile(operation)) {
      return executeModifySemanticModelRelationshipProfile(
        this.entityReader, this.entityWriter, operation);
    }
    return null;
  }

}

function executeCreateSemanticModelClassProfile(
  identifierSource: IdentifierSource,
  entityWriter: EntityWriter,
  { entity }: CreateSemanticModelClassProfile,
): OperationResult {
  const identifier = identifierSource.createIdentifier();
  const newEntity: SemanticModelClassProfile = {
    ...entity,
    id: identifier,
    type: [SEMANTIC_MODEL_CLASS_PROFILE],
  };
  entityWriter.change({ [identifier]: newEntity }, []);
  return {
    success: true,
    created: [identifier],
  };
}

function executeModifySemanticModelClassProfile(
  entityReader: EntityReader,
  entityWriter: EntityWriter,
  { identifier, entity }: ModifySemanticModelClassProfile,
): OperationResult {
  const previous = entityReader.entity(identifier);
  if (previous === null || !isSemanticModelClassProfile(previous)) {
    return {
      success: false,
      created: [],
    };
  };
  const updatedEntity: SemanticModelClassProfile = {
    id: identifier,
    type: [SEMANTIC_MODEL_CLASS_PROFILE],
    description: entity.description ?? previous.description,
    descriptionFromProfiled: entity.descriptionFromProfiled ?? previous.descriptionFromProfiled,
    name: entity.name ?? previous.name,
    nameFromProfiled: entity.nameFromProfiled ?? previous.nameFromProfiled,
    iri: entity.iri ?? previous.iri,
    usageNote: entity.usageNote ?? previous.usageNote,
    usageNoteFromProfiled: entity.usageNoteFromProfiled ?? previous.usageNoteFromProfiled,
    profiling: entity.profiling ?? previous.profiling,
  };
  entityWriter.change({ [identifier]: updatedEntity }, []);
  return {
    success: true,
    created: [],
  }
}

function executeCreateSemanticModelRelationshipProfile(
  identifierSource: IdentifierSource,
  entityWriter: EntityWriter,
  { entity }: CreateSemanticModelRelationshipProfile,
): OperationResult {
  const identifier = identifierSource.createIdentifier();
  const newEntity: SemanticModelRelationshipProfile = {
    ...entity,
    id: identifier,
    type: [SEMANTIC_MODEL_RELATIONSHIP_PROFILE],
    // We enforce two ends.
    ends: [{
      ...defaultRelationshipEndProfile(),
      ...entity.ends?.[0] ?? {},
    }, {
      ...defaultRelationshipEndProfile(),
      ...entity.ends?.[1] ?? {},
    }]
  };
  entityWriter.change({ [identifier]: newEntity }, []);
  return {
    success: true,
    created: [identifier],
  };
}

function defaultRelationshipEndProfile(): SemanticModelRelationshipEndProfile {
  return {
    name: null,
    nameFromProfiled: null,
    description: null,
    descriptionFromProfiled: null,
    iri: null,
    concept: null,
    conceptFromProfiled: null,
    cardinality: null,
    cardinalityFromProfiled: null,
    usageNote: null,
    usageNoteFromProfiled: null,
    profiling: [],
  }
}

function executeModifySemanticModelRelationshipProfile(
  entityReader: EntityReader,
  entityWriter: EntityWriter,
  { identifier, entity }: ModifySemanticModelRelationshipProfile,
): OperationResult {
  const previous = entityReader.entity(identifier);
  if (previous === null || !isSemanticModelRelationshipProfile(previous)) {
    return {
      success: false,
      created: [],
    };
  };
  const updatedEntity: SemanticModelRelationshipProfile = {
    id: identifier,
    type: [SEMANTIC_MODEL_RELATIONSHIP_PROFILE],
    // We enforce two ends.
    ends: [{
      ...previous.ends[0]!,
      ...entity.ends?.[0] ?? {},
    }, {
      ...previous.ends[1]!,
      ...entity.ends?.[1] ?? {},
    }],
  };
  entityWriter.change({ [identifier]: updatedEntity }, []);
  return {
    success: true,
    created: [],
  }
}

export function createDefaultSemanticModelProfileOperationExecutor(
  identifierSource: IdentifierSource,
  entityReader: EntityReader,
  entityWriter: EntityWriter,
) {
  return new DefaultSemanticModelProfileOperationExecutor(
    identifierSource, entityReader, entityWriter);
}
