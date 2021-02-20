import {RdfEntity} from "../rdf/rdf-api";
import {StatementSource} from "../rdf/statements/statements-api";
import {EntitySource} from "../rdf/entity-source";
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
  PsmAttribute,
  PsmAssociation,
  PsmChoice,
  PsmIncludes,
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
  let entityLoaded = false;
  if (types.includes(PIM.SCHEMA)) {
    await loadPimSchema(source, known, entitySource, PimSchema.as(result));
    entityLoaded = true;
  }
  if (types.includes(PIM.CLASS)) {
    await loadPimClass(source, known, entitySource, PimClass.as(result));
    entityLoaded = true;
  }
  if (types.includes(PIM.ATTRIBUTE)) {
    await loadPimAttribute(
      source, known, entitySource, PimAttribute.as(result));
    entityLoaded = true;
  }
  if (types.includes(PIM.ASSOCIATION)) {
    await loadPimAssociation(
      source, known, entitySource, PimAssociation.as(result));
    entityLoaded = true;
  }
  if (types.includes(PSM.SCHEMA)) {
    await loadPsmSchema(source, known, entitySource, PsmSchema.as(result));
    entityLoaded = true;
  }
  if (types.includes(PSM.CLASS)) {
    await loadPsmClass(source, known, entitySource, PsmClass.as(result));
    entityLoaded = true;
  }
  if (types.includes(PSM.ATTRIBUTE)) {
    await loadPsmAttribute(source, known, entitySource, PsmAttribute.as(result));
    entityLoaded = true;
  }
  if (types.includes(PSM.ASSOCIATION)) {
    await loadPsmAssociation(
      source, known, entitySource, PsmAssociation.as(result));
    entityLoaded = true;
  }
  if (types.includes(PSM.CHOICE)) {
    await loadPsmChoice(
      source, known, entitySource, PsmChoice.as(result));
    entityLoaded = true;
  }
  if (types.includes(PSM.INCLUDES)) {
    await loadPsmIncludes(source, known, entitySource, PsmIncludes.as(result));
    entityLoaded = true;
  }
  if (types.includes(CIM.ENTITY)) {
    await loadCimEntity(source, known, entitySource, CimEntity.as(result));
    entityLoaded = true;
  }
  if (!entityLoaded) {
    console.warn("No data loaded for:", entity.id, "of types:", types);
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
  pimSchema.pimHumanDescription = await loadLanguageString(
    entitySource, PIM.HAS_HUMAN_DESCRIPTION);
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
  resource.pimHumanDescription = await loadLanguageString(
    entitySource, PIM.HAS_HUMAN_DESCRIPTION);
}

async function loadPimClass(
  source: StatementSource, known: ResourceMap, entitySource: EntitySource,
  pimClass: PimClass
) {
  await loadPimBase(source, known, entitySource, pimClass);
  for (const {entity} of await entitySource.entitiesExtended(PIM.HAS_ISA)) {
    pimClass.pimIsa.push(entity.id);
    await loadFromEntity(source, known, entity);
  }
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
  // TODO Consider loading the entity.
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
    pimAssociation.pimEnd.push(
      await loadPimReference(source, known, entitySource));
  }
}

async function loadPimReference(
  source: StatementSource, known: ResourceMap, entitySource: EntitySource,
): Promise<PimAssociationEnd> {
  const result = new PimAssociationEnd();
  const entity = (await entitySource.entity(PIM.HAS_PARTICIPANT));
  if (entity !== undefined) {
    result.pimParticipant = entity.id;
    await loadFromEntity(source, known, entity);
  }
  return result;
}

async function loadPsmSchema(
  source: StatementSource, known: ResourceMap, entitySource: EntitySource,
  psmSchema: PsmSchema
) {
  psmSchema.psmHumanLabel = await loadLanguageString(
    entitySource, PSM.HAS_HUMAN_LABEL);
  psmSchema.psmHumanDescription = await loadLanguageString(
    entitySource, PSM.HAS_HUMAN_DESCRIPTION);
  psmSchema.psmTechnicalLabel =
    (await entitySource.literal(PSM.HAS_TECHNICAL_LABEL))?.value as string;
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
  for (const {entity} of await entitySource.entitiesExtended(PSM.HAS_EXTENDS)) {
    psmClass.psmExtends.push(entity.id);
    await loadFromEntity(source, known, entity);
  }
  for (const {entity} of await entitySource.entitiesExtended(PSM.HAS_PART)) {
    psmClass.psmParts.push(entity.id);
    await loadFromEntity(source, known, entity)
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
  psmBase.psmHumanDescription = await loadLanguageString(
    entitySource, PSM.HAS_HUMAN_DESCRIPTION);
}

async function loadPsmAttribute(
  source: StatementSource, known: ResourceMap, entitySource: EntitySource,
  psmAttribute: PsmAttribute
) {
  await loadPsmBase(source, known, entitySource, psmAttribute);
  for (const {entity} of await entitySource.entitiesExtended(PSM.HAS_PART)) {
    psmAttribute.psmParts.push(entity.id);
    await loadFromEntity(source, known, entity)
  }
}

async function loadPsmAssociation(
  source: StatementSource, known: ResourceMap, entitySource: EntitySource,
  psmAssociation:PsmAssociation
) {
  await loadPsmBase(source, known, entitySource, psmAssociation);
  for (const {entity} of await entitySource.entitiesExtended(PSM.HAS_PART)) {
    psmAssociation.psmParts.push(entity.id);
    await loadFromEntity(source, known, entity)
  }
}

async function loadPsmChoice(
  source: StatementSource, known: ResourceMap, entitySource: EntitySource,
  psmChoice: PsmChoice
) {
  await loadPsmBase(source, known, entitySource, psmChoice);
  for (const {entity} of await entitySource.entitiesExtended(PSM.HAS_PART)) {
    psmChoice.psmParts.push(entity.id);
    await loadFromEntity(source, known, entity);
  }
}

async function loadPsmIncludes(
  source: StatementSource, known: ResourceMap, entitySource: EntitySource,
  psmIncludes: PsmIncludes
) {
  await loadPsmBase(source, known, entitySource, psmIncludes);
  // This points to a RDF list.
  const includes = await entitySource.entitiesExtended(PSM.HAS_INCLUDES);
  for (const {entity} of includes) {
    psmIncludes.psmIncludes.push(entity.id);
    await loadFromEntity(source, known, entity);
  }
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
