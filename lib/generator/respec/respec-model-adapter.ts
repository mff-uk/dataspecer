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

/**
 * Predefined base types identified by IRI with labels as language strings.
 */
const BASE_TYPE_NAMES : {[iri:string]: Record<string, string>} = {
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
    "overview": loadReSpecOverview(context, schema),
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
      // We add all classes without schema, as we can not link to their
      // external definitions.
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
  // Return anything we found.
  for (const value of Object.values(str)) {
    return value;
  }
}

function loadReSpecOverview(
  context: AdapterContext, schema: SchemaData
): ReSpecOverview {
  return {
    "humanDescription" : selectString(context, schema.humanDescription),
  };
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
    "properties": loadClassDataProperties(context, classData),
    "identification": createClassIdentification(context, classData),
  };
}

function createClassIdentification(
  context: AdapterContext, classData: ClassData
): string {
  return "třída-" + sanitizeForIdentification(context, classData.humanLabel);
}

function sanitizeForIdentification(
  context: AdapterContext, content:Record<string, string>
) : string {
  return selectString(context, content)
    .toLowerCase()
    .replace(/ /g, "-");
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
    const propertyData = convertPropertyData(context, classData, property);
    result[propertyData.technicalLabel] = propertyData;
  }
  return Object.values(result);
}

function convertPropertyData(
  context: AdapterContext, owner: ClassData, propertyData: PropertyData,
): ReSpecProperty {
  const result = new ReSpecProperty();
  result.technicalLabel = propertyData.technicalLabel;
  result.humanLabel = selectString(context, propertyData.humanLabel);
  result.humanDescription =
    selectString(context, propertyData.humanDescription);
  result.examples = [];
  result.identification =
    createPropertyIdentification(context, owner, propertyData);
  //
  if (propertyData.dataTypePrimitive !== undefined) {
    result.type.push(convertPropertyPrimitive(context, propertyData));
  }
  for (const classData of propertyData.dataTypeClass) {
    result.type.push(convertPropertyClass(context, classData));
  }
  if (result.type.length === 0) {
    throw new Error(
      `Missing data type for ${propertyData.psmIri} with interpretation `
      + `${propertyData.cimIri}`
    );
  }
  return result;
}


function createPropertyIdentification(
  context: AdapterContext, owner: ClassData, propertyData: PropertyData
): string {
  return "vlastnost-"
    + sanitizeForIdentification(context, owner.humanLabel)
    + "-"
    + sanitizeForIdentification(context, propertyData.humanLabel);
}

function convertPropertyPrimitive(
  context: AdapterContext, propertyData: PropertyData
): ReSpecTypeReference {
  const dataType = propertyData.dataTypePrimitive;
  return {
    "isPrimitive": true,
    "label": selectString(context, BASE_TYPE_NAMES[dataType]) || dataType,
    "link": dataType,
    "codelist": undefined,
  };
}

function convertPropertyClass(
  context: AdapterContext, classData: ClassData
): ReSpecTypeReference {
  const label = selectString(context, classData.humanLabel) || classData.psmIri;
  return {
    "isPrimitive": false,
    "label": label,
    // We can use external or internal link.
    "link": classData.schema === undefined
      ? createClassIdentification(context, classData)
      : classData.schema.psmIri,
    "codelist": classData.isCodelist ? classData.cimIri : undefined,
  };
}

function loadReSpecExample(context: AdapterContext): ReSpecExample[] {
  return [];
}

function loadReSpecReference(context: AdapterContext): ReSpecReference {
  return new ReSpecReference();
}
