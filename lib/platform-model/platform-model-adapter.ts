import {RdfEntity, StatementSource} from "../rdf/statement/statement-api";
import {EntitySource} from "../rdf/statement/entity-source";
import {
  ModelResource,
  PimBase,
  PimSchema,
  PimClass,
  PimAttribute,
  PimAssociation,
  PimReference,
  PsmSchema,
  PsmBase,
  PsmClass,
  PsmPart, ModelResourceType,
} from "./platform-model";
import * as PIM from "./pim-vocabulary";
import * as PSM from "./psm-vocabulary";

type ResourceMap = Record<string, ModelResource>;

export function loadFromIri(
  source: StatementSource, known: ResourceMap, iri: string,
): Promise<ModelResource> {
  return loadFromEntity(source, known, RdfEntity.create(iri));
}

export async function loadFromEntity(
  source: StatementSource, known: ResourceMap, entity: RdfEntity,
  suggestedType?: string
): Promise<ModelResource> {
  const entitySource = EntitySource.forEntity(entity, source);
  let types = await entitySource.types();
  if (known[entitySource.id()] !== undefined) {
    return known[entitySource.id()];
  }
  const result = new ModelResource(entitySource.id(), types);
  known[entitySource.id()] = result;
  // If user does not provide type, we can sometimes use one from context.
  // We add here to not influence types stored in the resource.
  if (types.length === 0 && suggestedType !== undefined) {
    types = [suggestedType];
  }
  if (types.includes(PIM.SCHEMA)) {
    await loadPimSchema(source, known, entitySource, PimSchema.as(result));
  }
  if (types.includes(PIM.CLASS)) {
    await loadPimClass(source, known, entitySource, PimClass.as(result));
  }
  if (types.includes(PIM.ATTRIBUTE)) {
    await loadPimAttribute(
      source, known, entitySource, PimAttribute.as(result));
  }
  if (types.includes(PIM.ASSOCIATION)) {
    await loadPimAssociation(
      source, known, entitySource, PimAssociation.as(result));
  }
  if (types.includes(PSM.SCHEMA)) {
    await loadPsmSchema(source, known, entitySource, PsmSchema.as(result));
  }
  if (types.includes(PSM.CLASS)) {
    await loadPsmClass(source, known, entitySource, PsmClass.as(result));
  }
  if (types.includes(PSM.PART)) {
    await loadPsmPart(source, known, entitySource, PsmPart.as(result));
  }
  return result;
}

async function loadPimSchema(
  source: StatementSource, known: ResourceMap, entitySource: EntitySource,
  pimSchema: PimSchema
) {
  await loadPimBase(source, known, entitySource, pimSchema);
  for (const title of await entitySource.literals(PIM.HAS_TITLE)) {
    pimSchema.pimTitle[title.language || ""] = String(title.value);
  }
  for (const {entity} of await entitySource.entitiesExtended(PIM.HAS_PART)) {
    pimSchema.pimParts.push(entity.id);
    if (known[entity.id] == undefined) {
      await loadFromEntity(source, known, entity);
    }
  }
}

async function loadPimBase(
  source: StatementSource, known: ResourceMap, entitySource: EntitySource,
  resource: PimBase
) {
  resource.pimTechnicalLabel =
    (await entitySource.literal(PIM.HAS_TECHNICAL_LABEL))?.value as string;
  const interpretation = (await entitySource.entity(PIM.HAS_INTERPRETATION));
  if (interpretation !== undefined) {
    resource.pimInterpretation = interpretation.id;
    await loadFromEntity(source, known, interpretation);
  }

}

async function loadPimClass(
  source: StatementSource, known: ResourceMap, entitySource: EntitySource,
  pimClass: PimClass
) {
  await loadPimBase(source, known, entitySource, pimClass);
}

async function loadPimAttribute(
  source: StatementSource, known: ResourceMap, entitySource: EntitySource,
  pimAttribute: PimAttribute
) {
  await loadPimBase(source, known, entitySource, pimAttribute);
  pimAttribute.pimDatatype =
    (await entitySource.entity(PIM.HAS_DATA_TYPE))?.id;
  const classEntity = (await entitySource.entity(PIM.HAS_CLASS));
  if (classEntity) {
    pimAttribute.pimHasClass = classEntity.id;
    await loadFromEntity(source, known, classEntity);
  }
}

async function loadPimAssociation(
  source: StatementSource, known: ResourceMap, entitySource: EntitySource,
  pimAssociation: PimAssociation
) {
  await loadPimBase(source, known, entitySource, pimAssociation);
  const classEntity = (await entitySource.entity(PIM.HAS_CLASS));
  if (classEntity) {
    pimAssociation.pimHasClass = classEntity.id;
    await loadFromEntity(source, known, classEntity);
  }
  pimAssociation.pimEnd = [];
  for (const {entity} of await entitySource.entitiesExtended(PIM.HAS_END)) {
    const entitySource = EntitySource.forEntity(entity, source);
    pimAssociation.pimEnd.push(await loadPimReference(entitySource));
  }
}

async function loadPimReference(entitySource: EntitySource
): Promise<PimReference> {
  const result = new PimReference();
  result.pimParticipant = (await entitySource.entity(PIM.HAS_PARTICIPANT))?.id;
  return result;
}

async function loadPsmSchema(
  source: StatementSource, known: ResourceMap, entitySource: EntitySource,
  psmSchema: PsmSchema
) {
  for (const title of await entitySource.literals(PSM.HAS_TITLE)) {
    psmSchema.psmTitle[title.language || ""] = String(title.value);
  }
  for (const {entity} of await entitySource.entitiesExtended(PSM.HAS_ROOT)) {
    psmSchema.psmRoots.push(entity.id);
    await loadFromEntity(source, known, entity);
  }
  psmSchema.psmOfn = (await entitySource.entity(PSM.HAS_OFN))?.id;
}

async function loadPsmClass(
  source: StatementSource, known: ResourceMap, entitySource: EntitySource,
  psmClass: PsmClass
) {
  await loadPsmBase(source, known, entitySource, psmClass);
}

async function loadPsmBase(
  source: StatementSource, known: ResourceMap, entitySource: EntitySource,
  psmBase: PsmBase
) {
  psmBase.psmTechnicalLabel =
    (await entitySource.literal(PSM.HAS_TECHNICAL_LABEL))?.value as string;
  const interpretation = (await entitySource.entity(PSM.HAS_INTERPRETATION));
  if (interpretation !== undefined) {
    psmBase.psmInterpretation = interpretation.id;
    await loadFromEntity(source, known, interpretation);
  }
  for (const {entity} of await entitySource.entitiesExtended(PSM.HAS_EXTENDS)) {
    psmBase.psmExtends.push(entity.id);
    // await loadFromEntity(source, known, entity);
  }
  for (const {entity} of await entitySource.entitiesExtended(PSM.HAS_PART)) {
    psmBase.psmParts.push(entity.id);
    await loadFromEntity(source, known, entity, PSM.PART)
  }
}

async function loadPsmPart(
  source: StatementSource, known: ResourceMap, entitySource: EntitySource,
  psmPart: PsmPart
) {
  await loadPsmBase(source, known, entitySource, psmPart);
}
