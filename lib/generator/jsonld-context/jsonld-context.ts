import {
  ModelResource,
  ModelResourceType,
  PsmSchema,
} from "../../platform-model/platform-model";
import {
  PropertyData,
  ClassSimpleData,
  SchemaData,
} from "../schema-model";
import {loadSchemaFromEntities} from "../schema-model-adapter";

const RDFS_STRING = "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString";

type ResourceMap = Record<string, ModelResource>;

export class JsonldContextGeneratorOptions {

  /**
   * If set to true, scoped context is generated.
   */
  scoped: boolean = false;

}

/**
 * Does not utilize scoped context.
 */
export function generateJsonLdContext(
  entities: ResourceMap, entity: ModelResource,
  options: JsonldContextGeneratorOptions
) {
  if (!entity.types.includes(ModelResourceType.PsmSchema)) {
    throw Error("JsonLd Context generator can be used only with psm Schema.")
  }
  let result;
  const schemaEntity = entity as PsmSchema;
  if (options.scoped) {
    result = generateScopedJsonLdContext(entities, schemaEntity);
  } else {
    result = generateGlobalJsonLdContext(entities, schemaEntity);
  }
  return {"@context": result};
}

function generateScopedJsonLdContext(
  entities: ResourceMap, schemaEntity: PsmSchema
) {
  const schema = loadSchemaFromEntities(entities, schemaEntity.id);
  let result = {};
  if (schema.importSchema.length === 1) {
    result["@import"] = schema.importSchema[0].jsonLdContext;
  } else if (schema.importSchema.length > 1) {
    throw new Error("Only one schema can be imported.");
  }
  for (const root of schema.roots) {
    result[root.outputName] = {
      "@id": applyPrefix(schema, root.id),
      "@context": generateClassJsonLdContext(schema, root),
    };
  }
  return {
    "@version": 1.1,
    "iri": "@id",
    "typ": "@type",
    "@propagate": true,
    ...result,
    ...schema.prefixes,
  };
}

function generateClassJsonLdContext(
  schemaData: SchemaData, classData: ClassSimpleData
): object {
  let result = {
    "@version": 1.1
  };
  for (const property of classData.properties) {
    result = {...result, ...generatePropertyJsonLdContext(schemaData, property)};
  }
  for (const extendsClass of classData.extends) {
    if (shouldIncludeClass(schemaData, extendsClass)) {
      result = {
        ...result,
        ...generateClassJsonLdContext(schemaData, extendsClass)
      };
    }
  }
  return result;
}

function generatePropertyJsonLdContext(
  schemaData: SchemaData, propertyData: PropertyData
): object {
  const result = {
    "@id": applyPrefix(schemaData, propertyData.id),
  };
  if (propertyData.dataTypeSchema !== undefined) {
    result["@context"] = propertyData.dataTypeSchema.jsonLdContext;
  } else if (propertyData.dataTypeClass !== undefined) {
    // TODO Here we just say it is @id, but should we for example
    //   unpack the structure ?
    result["@type"] = "@id";
  } else {
    const dataType = propertyData.datatype;
    if (dataType === RDFS_STRING) {
      result["@container"] = "@language";
    } else {
      result["@type"] = applyPrefix(schemaData, dataType);
    }
  }
  return {[propertyData.technicalLabel]: result};
}

function shouldIncludeClass(
  schemaData: SchemaData, classData: ClassSimpleData
): boolean {
  for (const importSchema of schemaData.importSchema) {
    for (const root of importSchema.roots) {
      if (root.id === classData.id) {
        return false;
      }
    }
  }
  return true;
}

function applyPrefix(schemaData: SchemaData, iri: string): string {
  for (const [key, prefix] of Object.entries(schemaData.prefixes)) {
    if (iri.startsWith(prefix)) {
      return key + ":" + iri.substr(prefix.length);
    }
  }
  return iri;
}

function generateGlobalJsonLdContext(
  entities: ResourceMap, schemaEntity: PsmSchema
): object {
  const schema = loadSchemaFromEntities(entities, schemaEntity.id);
  let result = {};
  if (schema.importSchema.length === 1) {
    result["@import"] = schema.importSchema[0].jsonLdContext;
  } else if (schema.importSchema.length > 1) {
    throw new Error("Only one schema can be imported.");
  }
  for (const root of schema.roots) {
    result = {...result, ...generateClassJsonLdContext(schema, root)};
  }
  return {
    "@version": 1.1,
    "iri": "@id",
    "typ": "@type",
    ...result,
    ...schema.prefixes,
  };
}
