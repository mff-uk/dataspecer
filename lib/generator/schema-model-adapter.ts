import {
  ModelResource,
  ModelResourceType,
  PsmSchema,
  PsmClass,
  PsmPart,
  PimAttribute,
  PimAssociation,
  PimClass,
  PsmChoice,
  CimEntity,
} from "../platform-model/platform-model";
import {
  ClassData,
  PropertyData,
  SchemaData
} from "./schema-model";

type ResourceMap = Record<string, ModelResource>;

/**
 * As some entities may be referenced multiple times, we want to
 * avoid loading them each time. So we use this cache.
 * It also allow us to deal with cycles.
 */
class LoaderContext {

  readonly psmSchema: Record<string, SchemaData> = {};

  readonly psmClass: Record<string, ClassData> = {};

  readonly pimClass: Record<string, ClassData> = {};

  readonly cimClass: Record<string, ClassData> = {};

  readonly psmPartProperty: Record<string, PropertyData> = {};

  readonly pimAttributeProperty: Record<string, PropertyData> = {};

  readonly pimAssociationProperty: Record<string, PropertyData> = {};

  readonly cimProperty: Record<string, PropertyData> = {};

  /**
   * All already loaded entities.
   */
  readonly entities: ResourceMap;

  constructor(entities: ResourceMap) {
    this.entities = entities;
  }

}

export function loadSchemaFromEntities(
  entities: ResourceMap, iri: string
): SchemaData | undefined {
  return loadSchema(new LoaderContext(entities), iri);
}

export function loadSchema(
  context: LoaderContext, iri: string
): SchemaData | undefined {
  const entity = context.entities[iri];
  if (entity?.types.includes(ModelResourceType.PsmSchema)) {
    return loadSchemaFromPsmSchema(context, entity as PsmSchema);
  }
  if (entity?.types.length > 0) {
    throw new Error(`Unexpected types ${entity.types} for schema.`);
  }
  return undefined;
}

function loadSchemaFromPsmSchema(
  context: LoaderContext, schemaEntity: PsmSchema
): SchemaData {
  if (context.psmSchema[schemaEntity.id] !== undefined) {
    return context.psmSchema[schemaEntity.id];
  }
  const result = new SchemaData();
  context.psmSchema[schemaEntity.id] = result;
  //
  result.iri = schemaEntity.id;
  result.humanLabel = schemaEntity.psmHumanLabel;
  result.roots = schemaEntity.psmRoots
    .map(iri => loadClass(context, iri))
    .filter(entity => entity !== undefined);
  result.jsonLdContext = schemaEntity.psmJsonLdContext;
  result.fos = schemaEntity.psmFos;
  result.prefixes = schemaEntity.psmPrefix;
  return result;
}

function loadClass(
  context: LoaderContext, iri: string
): ClassData {
  if (iri === undefined) {
    return undefined;
  }
  const entity = context.entities[iri];
  if (entity?.types.includes(ModelResourceType.PsmClass)) {
    return loadClassFromPsmClass(context, entity as PsmClass);
  }
  if (entity?.types.includes(ModelResourceType.PimClass)) {
    return loadClassFromPimClass(context, entity as PimClass);
  }
  if (entity?.types.includes(ModelResourceType.CimEntity)) {
    return loadClassFromCimEntity(context, entity as CimEntity);
  }
  throw new Error(`Unexpected type(s) ${entity.types} for class: ${iri}`);
}

function loadClassFromPsmClass(
  context: LoaderContext, classEntity: PsmClass
): ClassData {
  if (context.psmClass[classEntity.id] !== undefined) {
    return context.psmClass[classEntity.id];
  }
  const result = new ClassData();
  result.iri = classEntity.id;
  result.id = classEntity.id;
  context.psmClass[classEntity.id] = result;
  // PsmBase
  result.technicalLabel = classEntity.psmTechnicalLabel;
  result.humanLabel = classEntity.psmHumanLabel;
  result.extends = classEntity.psmExtends
    .map(iri => loadClass(context, iri))
    .filter(item => item !== undefined);
  result.properties = classEntity.psmParts
    .map(iri => loadProperty(context, iri))
    .filter(item => item !== undefined);
  // PsmClass
  if (classEntity.psmSchema !== undefined) {
    result.schema = loadSchema(context, classEntity.psmSchema);
  }
  //
  const interpretation = loadClass(context, classEntity.psmInterpretation);
  result.withInterpretation(interpretation);
  return result;
}

function loadClassFromPimClass(
  context: LoaderContext, classEntity: PimClass
): ClassData {
  if (context.pimClass[classEntity.id] !== undefined) {
    return context.pimClass[classEntity.id];
  }
  const result = new ClassData();
  result.iri = classEntity.id;
  result.id = classEntity.id;
  context.pimClass[classEntity.id] = result;
  // PimBase
  result.technicalLabel = classEntity.pimTechnicalLabel;
  result.humanLabel = classEntity.pimHumanLabel;
  //
  const interpretation = loadClass(context, classEntity.pimInterpretation);
  result.withInterpretation(interpretation);
  return result;
}

function loadClassFromCimEntity(
  context: LoaderContext, cimEntity: CimEntity
): ClassData {
  const result = new ClassData();
  result.iri = cimEntity.id;
  result.id = cimEntity.id;
  context.cimClass[cimEntity.id] = result;
  // CimEntity
  result.humanLabel = cimEntity.cimHumanLabel;
  result.humanDescription = cimEntity.cimHumanDescription;
  result.isCodelist = cimEntity.cimIsCodelist;
  return result;
}

function loadProperty(context: LoaderContext, iri: string): PropertyData {
  if (iri === undefined) {
    return undefined;
  }
  const entity = context.entities[iri];
  if (entity?.types.includes(ModelResourceType.PsmPart)) {
    return loadPropertyFromPsmPart(context, entity as PsmPart);
  }
  if (entity?.types.includes(ModelResourceType.PimAttribute)) {
    return loadPropertyFromPimAttribute(context, entity as PimAttribute);
  }
  if (entity?.types.includes(ModelResourceType.PimAssociation)) {
    return loadPropertyFromPimAssociation(context, entity as PimAssociation);
  }
  if (entity?.types.includes(ModelResourceType.CimEntity)) {
    return loadPropertyFromCimEntity(context, entity as CimEntity);
  }
  throw new Error(`Unexpected type(s) ${entity.types} for property: ${iri}`);
}

function loadPropertyFromPsmPart(
  context: LoaderContext, partEntity: PsmPart
): PropertyData {
  if (context.psmPartProperty[partEntity.id] !== undefined) {
    return context.psmPartProperty[partEntity.id];
  }
  const result = new PropertyData();
  result.iri = partEntity.id;
  result.id = partEntity.id;
  context.psmPartProperty[partEntity.id] = result;
  // PsmBase
  result.technicalLabel = partEntity.psmTechnicalLabel;
  result.humanLabel = partEntity.psmHumanLabel;
  loadPropertyFromPsmPartDataType(context, partEntity, result);
  //
  const interpretation = loadProperty(context, partEntity.psmInterpretation);
  result.withInterpretation(interpretation)
  return result;
}

function loadPropertyFromPsmPartDataType(
  context: LoaderContext, partEntity: PsmPart, propertyData: PropertyData
) {
  if (partEntity.psmParts.length === 0) {
    return;
  }
  if (partEntity.psmParts?.length > 1) {
    throw new Error(
      `Only one part is allowed for psm:Part for ${partEntity.id}`);
  }
  for (const iri of partEntity.psmParts) {
    const entity = context.entities[iri];
    if (entity === undefined) {
      throw new Error(`Missing definition.`)
    }
    if (entity.types.includes(ModelResourceType.PsmClass)) {
      propertyData.dataTypeClass.push(loadClass(context, entity.id));
    } else if (entity.types.includes(ModelResourceType.PsmChoice)) {
      propertyData.dataTypeClass.push(
        ...loadPsmChoice(context, entity as PsmChoice));
    } else {
      throw new Error(
        partEntity.id
        + " of type psm:Part has unexpected type for "
        + entity.id
        + " of types [" + entity.types.join(",")
        + "] interpretation of "
        + partEntity.psmInterpretation
      )
    }
  }
  return propertyData;
}

function loadPsmChoice(
  context: LoaderContext, psmChoice: PsmChoice
): ClassData[] {
  return loadPsmClassFromParts(context, psmChoice, "psm:Choice");
}

/**
 * We do not use cache here, as the result of this function, an array,
 * is often merged to another array, so caching would not help
 * to break the circular dependency.
 */
function loadPsmClassFromParts(
  context: LoaderContext, psmPart: PsmPart, psmPartType: string,
): ClassData[] {
  const result = [];
  for (const iri of psmPart.psmParts) {
    const entity = context.entities[iri];
    if (entity === undefined) {
      throw new Error(`Missing definition.`)
    }
    if (entity.types.includes(ModelResourceType.PsmClass)) {
      result.push(loadClass(context, entity.id));
    } else {
      throw new Error(
        psmPart.id
        + " of type " + psmPartType + " has unexpected type for "
        + entity.id
        + " of types [" + entity.types.join(",")
        + "] interpretation of "
        + psmPart.psmInterpretation
      )
    }
  }
  return result;
}

function loadPropertyFromPimAttribute(
  context: LoaderContext, attributeEntity: PimAttribute
): PropertyData {
  if (context.pimAttributeProperty[attributeEntity.id] !== undefined) {
    return context.pimAttributeProperty[attributeEntity.id];
  }
  const result = new PropertyData();
  result.iri = attributeEntity.id;
  result.id = attributeEntity.id;
  context.pimAttributeProperty[attributeEntity.id] = result;
  // PimBase
  result.technicalLabel = attributeEntity.pimTechnicalLabel;
  result.humanLabel = attributeEntity.pimHumanLabel;
  // PimAttribute
  result.datatype = attributeEntity.pimDatatype;
  //
  const interpretation = loadProperty(
    context, attributeEntity.pimInterpretation);
  result.withInterpretation(interpretation);
  return result;
}

function loadPropertyFromPimAssociation(
  context: LoaderContext, associationEntity: PimAssociation
): PropertyData {
  if (context.pimAssociationProperty[associationEntity.id] !== undefined) {
    return context.pimAssociationProperty[associationEntity.id];
  }
  const result = new PropertyData();
  result.iri = associationEntity.id;
  result.id = associationEntity.id;
  context.pimAssociationProperty[associationEntity.id] = result;
  // PimBase
  result.technicalLabel = associationEntity.pimTechnicalLabel;
  result.humanLabel = associationEntity.pimHumanLabel;
  // PimAssociation
  if (associationEntity.pimEnd.length !== 2) {
    throw new Error(
      "Invalid number of pim:hasEnd " +
      + associationEntity.pimEnd.length
      + " (two expected) for " + associationEntity.id);
  }
  const pimEnd = associationEntity.pimEnd[0];
  result.dataTypeClass = [loadClass(context, pimEnd.pimParticipant)];
  //
  const interpretation = loadProperty(
    context, associationEntity.pimInterpretation);
  result.withInterpretation(interpretation);
  return result;
}


function loadPropertyFromCimEntity(
  context: LoaderContext, cimEntity: CimEntity
): PropertyData {
  const result = new PropertyData();
  result.iri = cimEntity.id;
  result.id = cimEntity.id;
  context.cimProperty[cimEntity.id] = result;
  // CimEntity
  result.humanLabel = cimEntity.cimHumanLabel;
  result.humanDescription = cimEntity.cimHumanDescription;
  return result;
}
