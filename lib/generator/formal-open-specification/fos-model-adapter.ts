import {
  ClassData,
  ClassNodeData,
  ClassSimpleData,
  PropertyData,
  SchemaData,
} from "../schema-model";
import {
  FormalOpenSpecification,
  FosPropertyType,
  FosEntity,
  FosExample,
  FosMetadata,
  FosOverview,
  FosProperty,
  FosReference,
  FosSpecification,
} from "./fos-model";

const BASE_TYPE_NAMES = {
  "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString": {
    "": "Text"
  },
};

class AdapterContext {

  readonly schema: SchemaData;

  constructor(schema: SchemaData) {
    this.schema = schema;
  }

}

export function schemaAsFormalOpenSpecification(
  schema: SchemaData
): FormalOpenSpecification {
  const context = new AdapterContext(schema);
  return {
    "metadata": loadFosMetadata(context),
    "overview": loadFosOverview(context),
    "specification": loadFosSpecification(context),
    "examples": loadFosExample(context),
    "references": loadFosReference(context),
  };
}

function loadFosMetadata(context: AdapterContext): FosMetadata {
  return {
    "title": selectString(context, context.schema.humanLabel),
  }
}

function selectString(
  context: AdapterContext, str: Record<string, string> | undefined
): string {
  if (str === undefined) {
    return "";
  }
  if (str[""] !== undefined) {
    return str[""];
  }
  for (const [language, value] of Object.entries(str)) {
    return value;
  }
}

function loadFosOverview(context: AdapterContext): FosOverview {
  return {};
}

function loadFosSpecification(context: AdapterContext): FosSpecification {
  const entities = []
  for (const classData of context.schema.roots) {
    entities.push(...convertClassData(context, classData));
  }
  return {
    "entities": entities,
  };
}

function convertClassData(
  context: AdapterContext, classData: ClassData
): FosEntity[] {
  if (classData.isClassSimpleData()) {
    return convertClassSimpleData(context, classData);
  }
  if (classData.isClassNodeData()) {
    return convertClassNodeData(context, classData);
  }
  throw new Error("");
}

function convertClassSimpleData(
  context: AdapterContext, classData: ClassSimpleData
): FosEntity[] {
  return [{
    "humanLabel": selectString(context, classData.humanLabel),
    "humanDescription": "",
    "properties": Object.values(collectProperties(context, classData)),
  }];
}

function collectProperties(
  context: AdapterContext, classData: ClassSimpleData
): Record<string, FosProperty> {
  let result = {};
  for (const extendedClass of classData.extends) {
    if (extendedClass.isClassSimpleData()) {
      result = {
        ...result,
        ...collectProperties(context, extendedClass),
      };
    }
    throw new Error("Extending a non simple class is not supported.");
  }
  for (const property of classData.properties) {
    const propertyData = convertPropertyData(context, property);
    result[propertyData.technicalLabel] = propertyData;
  }
  return result;
}

function convertPropertyData(
  context: AdapterContext, propertyData: PropertyData,
): FosProperty {
  const result = {
    "propertyType": FosPropertyType.Association,
    "technicalLabel": propertyData.technicalLabel,
    "humanLabel": selectString(context, propertyData.humanLabel),
    "description": selectString(context, propertyData.humanDescription),
    // Loaded bellow.
    "typeLabel": "",
    "typeValue": "",
    "examples": [],
  };
  if (propertyData.dataTypeSchema.length === 1) {
    return {
      ...result,
      ...convertTypeSchema(context, propertyData.dataTypeSchema[0]),
    };
  } else if (propertyData.dataTypeSchema.length > 1) {
    throw new Error(
      `Multiple schemas detected for '${propertyData.technicalLabel}'`
    );
  } else if (propertyData.dataTypeClass.length === 1) {
    throw new Error(
      `Class not supported for '${propertyData.technicalLabel}'`);
  } else if (propertyData.dataTypeClass.length > 1) {
    throw new Error(
      `Multiple classes detected for '${propertyData.technicalLabel}'`
    );
  } else if (propertyData.datatype !== undefined) {
    return {
      ...result,
      ...convertDataType(context, propertyData),
    };
  } else {
    throw new Error(
      `Missing data type for '${propertyData.technicalLabel}'`
    );
  }
}

function convertTypeSchema(context: AdapterContext, schemaData: SchemaData) {
  return {
    "propertyType": FosPropertyType.Association,
    "typeValue": schemaData.fos,
    "typeLabel": selectString(context, schemaData.humanLabel),
  };
}

function convertDataType(context: AdapterContext, propertyData: PropertyData) {
  return {
    "propertyType": FosPropertyType.Attribute,
    "typeLabel":
      selectString(context, BASE_TYPE_NAMES[propertyData.datatype])
      || propertyData.datatype,
    "typeValue": propertyData.datatype,
  };
}

function convertClassNodeData(
  context: AdapterContext, classData: ClassNodeData
): FosEntity[] {
  throw new Error("Class node is not supported!");
}

function loadFosExample(context: AdapterContext): FosExample[] {
  return [];
}

function loadFosReference(context: AdapterContext): FosReference {
  return {};
}
