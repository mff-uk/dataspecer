import {RdfEntity, StatementSource} from "../rdf/statement/statement-api";
import {EntitySource} from "../rdf/statement/entity-source";
import {
  ModelResource,
  PimBase,
  PimSchema,
  PimClass,
  PimAttribute,
  PimAssociation,
  PimAssociationEnd,
  PsmSchema,
  PsmBase,
  PsmClass,
  PsmPart,
  PsmChoice,
  CimEntity,
} from "./platform-model";
import * as PSM from "./psm-vocabulary";
import * as PIM from "./pim-vocabulary";
import * as CIM from "./cim-vocabulary";

type ResourceMap = Record<string, ModelResource>;

export function loadFromIri(
  source: StatementSource, known: ResourceMap, iri: string,
): Promise<ModelResource> {
  return loadFromEntity(source, known, RdfEntity.create(iri));
}

/**
 * When called for already loaded entity, just return the value. This
 * allows for easy loading of cycles.
 */
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
  if (types.includes(PSM.CHOICE)) {
    await loadPsmChoice(
      source, known, entitySource, PsmChoice.as(result));
  }
  if (types.includes(PSM.PART)) {
    await loadPsmPart(source, known, entitySource, PsmPart.as(result));
  }
  if (types.includes(CIM.ENTITY)) {
    await loadCimEntity(source, known, entitySource, CimEntity.as(result));
  }
  return result;
}

async function loadPimSchema(
  source: StatementSource, known: ResourceMap, entitySource: EntitySource,
  pimSchema: PimSchema
) {
  await loadPimBase(source, known, entitySource, pimSchema);
  pimSchema.pimHumanLabel = await loadLanguageString(
    entitySource, PIM.HAS_HUMAN_LABEL);
  for (const {entity} of await entitySource.entitiesExtended(PIM.HAS_PART)) {
    pimSchema.pimParts.push(entity.id);
    if (known[entity.id] == undefined) {
      await loadFromEntity(source, known, entity);
    }
  }
}

async function loadLanguageString(
  entitySource: EntitySource, predicate: string
): Promise<Record<string, string>> {
  const literals = await entitySource.literals(predicate)
  if (literals === undefined || literals.length === 0) {
    return null;
  }
  const result = {};
  for (const title of literals) {
    result[title.language || ""] = String(title.value);
  }
  return result;
}

async function loadPimBase(
  source: StatementSource, known: ResourceMap, entitySource: EntitySource,
  resource: PimBase
) {
  const interpretation = (await entitySource.entity(PIM.HAS_INTERPRETATION));
  if (interpretation !== undefined) {
    resource.pimInterpretation = interpretation.id;
    await loadFromEntity(source, known, interpretation, CIM.ENTITY);
  }
  resource.pimTechnicalLabel =
    (await entitySource.literal(PIM.HAS_TECHNICAL_LABEL))?.value as string;
  resource.pimHumanLabel = await loadLanguageString(
    entitySource, PIM.HAS_HUMAN_LABEL);
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
  const classEntity = (await entitySource.entity(PIM.HAS_CLASS));
  if (classEntity) {
    pimAttribute.pimHasClass = classEntity.id;
    await loadFromEntity(source, known, classEntity);
  }
  pimAttribute.pimDatatype =
    (await entitySource.entity(PIM.HAS_DATA_TYPE))?.id;
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
): Promise<PimAssociationEnd> {
  const result = new PimAssociationEnd();
  result.pimParticipant = (await entitySource.entity(PIM.HAS_PARTICIPANT))?.id;
  return result;
}

async function loadPsmSchema(
  source: StatementSource, known: ResourceMap, entitySource: EntitySource,
  psmSchema: PsmSchema
) {
  psmSchema.psmHumanLabel = await loadLanguageString(
    entitySource, PSM.HAS_HUMAN_LABEL);
  for (const {entity} of await entitySource.entitiesExtended(PSM.HAS_ROOT)) {
    psmSchema.psmRoots.push(entity.id);
    await loadFromEntity(source, known, entity);
  }
  psmSchema.psmJsonLdContext =
    (await entitySource.entity(PSM.HAS_JSONLD_CONTEXT_URL))?.id;
  psmSchema.psmFos =
    (await entitySource.entity(PSM.HAS_FOS_URL))?.id;
  for (const prefixEntity of await entitySource.entities(PSM.HAS_PREFIX)) {
    const prefixSource = EntitySource.forEntity(prefixEntity, source);
    const name = (await prefixSource.literal(PSM.HAS_PREFIX_NAME))?.value;
    const url = (await prefixSource.entity(PSM.HAS_PREFIX_URL))?.id;
    if (name !== undefined && url !== undefined) {
      psmSchema.psmPrefix[String(name)] = url;
    }
  }
}

async function loadPsmClass(
  source: StatementSource, known: ResourceMap, entitySource: EntitySource,
  psmClass: PsmClass
) {
  await loadPsmBase(source, known, entitySource, psmClass);
  const schemas = await source.reverseProperties(
    PSM.HAS_ROOT, psmClass.id);
  if (schemas.length === 1) {
    psmClass.psmSchema = schemas[0].id;
    await loadFromIri(source, known, psmClass.psmSchema);
  } else if (schemas.length > 1) {
    throw Error(
      "Multiple psm:Schemas ("
      + schemas.map(item => (item as any).id).join(", ")
      +") specified for a single class ("
      + psmClass.id
      + ")."
      + "At most one is allowed.")
  }
}

async function loadPsmBase(
  source: StatementSource, known: ResourceMap, entitySource: EntitySource,
  psmBase: PsmBase
) {
  const interpretation = (await entitySource.entity(PSM.HAS_INTERPRETATION));
  if (interpretation !== undefined) {
    psmBase.psmInterpretation = interpretation.id;
    await loadFromEntity(source, known, interpretation);
  }
  psmBase.psmTechnicalLabel =
    (await entitySource.literal(PSM.HAS_TECHNICAL_LABEL))?.value as string;
  psmBase.psmHumanLabel = await loadLanguageString(
    entitySource, PSM.HAS_HUMAN_LABEL);
  for (const {entity} of await entitySource.entitiesExtended(PSM.HAS_EXTENDS)) {
    psmBase.psmExtends.push(entity.id);
    await loadFromEntity(source, known, entity);
  }
  for (const {entity} of await entitySource.entitiesExtended(PSM.HAS_PART)) {
    psmBase.psmParts.push(entity.id);
    await loadFromEntity(source, known, entity, PSM.PART)
  }
}

async function loadPsmChoice(
  source: StatementSource, known: ResourceMap, entitySource: EntitySource,
  psmChoice: PsmChoice
) {
  await loadPsmBase(source, known, entitySource, psmChoice);
}

async function loadPsmPart(
  source: StatementSource, known: ResourceMap, entitySource: EntitySource,
  psmPart: PsmPart
) {
  await loadPsmBase(source, known, entitySource, psmPart);
}

async function loadCimEntity(
  source: StatementSource, known: ResourceMap, entitySource: EntitySource,
  cimEntity: CimEntity
) {
  cimEntity.cimHumanLabel = await loadLanguageString(
    entitySource, CIM.HAS_HUMAN_LABEL);
  cimEntity.cimHumanDescription = await loadLanguageString(
    entitySource, CIM.HAS_HUMAN_DESCRIPTION);
  cimEntity.cimIsCodelist = cimEntity.rdfTypes.includes(CIM.CODELIST);
}
