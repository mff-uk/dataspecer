import {
  ClassData,
  PropertyData,
  SchemaData,
} from "../../entity-model/entity-model";
import {
  ReSpec,
  ReSpecEntity,
  ReSpecExample,
  ReSpecMetadata,
  ReSpecOverview,
  ReSpecProperty,
  ReSpecReference,
  ReSpecSpecification,
  ReSpecTypeReference,
} from "./respec-model";

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

export function schemaAsReSpec(schema: SchemaData): ReSpec {
  const context = new AdapterContext(schema);
  const allRoots = selectRootClasses(schema);
  setSchemaToClasses(schema, allRoots);
  return {
    "metadata": loadReSpecMetadata(context),
    "overview": loadReSpecOverview(context),
    "specification": loadReSpecSpecification(context, allRoots),
    "examples": loadReSpecExample(context),
    "references": loadReSpecReference(context),
  };
}

/**
 * The schema contains root class as specified by the schema, but
 * we also need to add classes without schema.
 */
function selectRootClasses(schema: SchemaData): ClassData [] {
  let roots: Record<string, ClassData> = {};
  for (const classData of schema.roots) {
    roots = {
      ...roots,
      [classData.psmIri]: classData,
      ...collectClassesWithoutSchema(classData)
    };
  }
  return Object.values(roots);
}

/**
 * Search recursively class for all classes without schema.
 */
function collectClassesWithoutSchema(
  classData: ClassData
): Record<string, ClassData> {
  let result = {};
  for (const property of classData.properties) {
    for (const propertyClass of property.dataTypeClass) {
      if (propertyClass.schema !== undefined) {
        // We have schema so no need to check any further.
        continue;
      }
      result = {
        ...result,
        [propertyClass.psmIri]: propertyClass,
        ...collectClassesWithoutSchema(propertyClass)
      };
    }
  }
  return result;
}

/**
 * Set given schema as the schema for all given classes.
 */
function setSchemaToClasses(schema: SchemaData, classes: ClassData []) {
  for (const classData of classes) {
    classData.schema = schema;
  }
}

function loadReSpecMetadata(context: AdapterContext): ReSpecMetadata {
  return {
    "title": selectString(context, context.schema.humanLabel),
  }
}

function selectString(
  context: AdapterContext, str: Record<string, string> | undefined
): string {
  if (str === undefined || str === null) {
    return "";
  }
  if (str[""] !== undefined) {
    return str[""];
  }
  for (const value of Object.values(str)) {
    return value;
  }
}

function loadReSpecOverview(context: AdapterContext): ReSpecOverview {
  return new ReSpecOverview();
}

function loadReSpecSpecification(
  context: AdapterContext, roots: ClassData []
): ReSpecSpecification {
  return {
    "entities": roots.map(classData =>
      loadReSpecSpecificationClassData(context, classData)),
  };
}

function loadReSpecSpecificationClassData(
  context: AdapterContext, classData: ClassData
): ReSpecEntity {
  return {
    "humanLabel": selectString(context, classData.humanLabel),
    "humanDescription": selectString(context, classData.humanDescription),
    "relativeLink": createClassDataRelativeLink(context, classData),
    "properties": loadClassDataProperties(context, classData),
  };
}

function createClassDataRelativeLink(
  context: AdapterContext, classData: ClassData
): string {
  return selectString(context, classData.humanLabel)
    .toLowerCase()
    .replace(" ", "-");
}

function loadClassDataProperties(
  context: AdapterContext, classData: ClassData
): ReSpecProperty[] {
  let result = {};
  for (const extendedClass of classData.extends) {
    for (const property of loadClassDataProperties(context, extendedClass)) {
      result[property.technicalLabel] = property;
    }
  }
  for (const property of classData.properties) {
    const propertyData = convertPropertyData(context, property);
    result[propertyData.technicalLabel] = propertyData;
  }
  return Object.values(result);
}

function convertPropertyData(
  context: AdapterContext, propertyData: PropertyData,
): ReSpecProperty {
  const result = new ReSpecProperty();
  result.technicalLabel = propertyData.technicalLabel;
  result.humanLabel = selectString(context, propertyData.humanLabel);
  result.humanDescription =
    selectString(context, propertyData.humanDescription);
  result.examples = [];
  result.relativeLink = createPropertyRelativeLink(context, propertyData);
  //
  if (propertyData.dataTypePrimitive !== undefined) {
    result.type.push(convertPropertyType(context, propertyData));
  }
  for (const classData of propertyData.dataTypeClass) {
    result.type.push(convertPropertyTypeClass(context, classData));
  }
  if (result.type.length === 0) {
    throw new Error(
      `Missing data type for ${propertyData.psmIri} with interpretation `
      + `${propertyData.cimIri}`
    );
  }
  return result;
}


function createPropertyRelativeLink(
  context: AdapterContext, propertyData: PropertyData
): string {
  return selectString(context, propertyData.humanLabel).toLowerCase();
}

function convertPropertyType(
  context: AdapterContext, propertyData: PropertyData
): ReSpecTypeReference {
  const dataType = propertyData.dataTypePrimitive;
  return {
    "isPrimitive": true,
    "label": selectString(context, BASE_TYPE_NAMES[dataType]) || dataType,
    "schemaLink": dataType,
    "relativeLink": "",
  };
}

function convertPropertyTypeClass(
  context: AdapterContext, classData: ClassData
): ReSpecTypeReference {
  const label = selectString(context, classData.humanLabel) || classData.psmIri;
  if (classData.schema === undefined) {
    console.warn(
      `Class [${classData.iris}] is without schema.`)
  }
  return {
    "isPrimitive": false,
    "label": label,
    "schemaLink": classData.schema?.psmIri,
    "relativeLink": createClassDataRelativeLink(context, classData),
  };
}

function loadReSpecExample(context: AdapterContext): ReSpecExample[] {
  return [];
}

function loadReSpecReference(context: AdapterContext): ReSpecReference {
  return new ReSpecReference();
}
