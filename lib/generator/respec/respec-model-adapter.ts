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
const BASE_TYPE_NAMES: { [iri: string]: Record<string, string> } = {};

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
    "examples": loadReSpecExample(),
    "references": loadReSpecReference(),
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
      ...collectClassesWithoutSchema(classData),
    };
  }
  return Object.values(roots);
}

/**
 * Search recursively class for all classes without schema.
 */
function collectClassesWithoutSchema(
  classData: ClassData,
): Record<string, ClassData> {
  let result = {};
  for (const property of classData.properties) {
    for (const propertyClass of property.dataTypeClass) {
      if (shouldBeRootClass(propertyClass)) {
        result = {
          ...result,
          [propertyClass.psmIri]: propertyClass,
          ...collectClassesWithoutSchema(propertyClass),
        };
      }
    }
  }
  return result;
}

function shouldBeRootClass(classData: ClassData): boolean {
  if (classData.schema !== undefined) {
    // Class with schema should not be included, as they
    // are in their own ReSpec files.
    return false;
  }
  if (classData.isCodelist) {
    // Codelist should be put on output always.
    return true;
  }
  return !isClassValue(classData);
}

/**
 * An empty class refer to an identifier, IRI for RDF, for entity
 * of the class. Such class should not be included in the list of classes.
 */
function isClassValue(classData: ClassData): boolean {
  return !classData.isCodelist && classData.properties.length === 0;
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
  };
}

function selectString(
  context: AdapterContext, str: Record<string, string> | undefined,
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
  context: AdapterContext, schema: SchemaData,
): ReSpecOverview {
  return {
    "humanDescription": selectString(context, schema.humanDescription),
  };
}

function loadReSpecSpecification(
  context: AdapterContext, roots: ClassData [],
): ReSpecSpecification {
  return {
    "entities": roots.map(classData =>
      loadReSpecSpecificationClassData(context, classData)),
  };
}

function loadReSpecSpecificationClassData(
  context: AdapterContext, classData: ClassData,
): ReSpecEntity {
  return {
    "humanLabel": selectString(context, classData.humanLabel),
    "humanDescription": selectString(context, classData.humanDescription),
    "properties": loadClassDataProperties(context, classData),
    "identification": createClassIdentification(context, classData),
    "isCodelist": classData.isCodelist,
  };
}

function createClassIdentification(
  context: AdapterContext, classData: ClassData,
): string {
  return "třída-" + sanitizeForIdentification(context, classData.humanLabel);
}

function sanitizeForIdentification(
  context: AdapterContext, content: Record<string, string>,
): string {
  return selectString(context, content)
    .toLowerCase()
    .replace(/ /g, "-");
}

function loadClassDataProperties(
  context: AdapterContext, classData: ClassData,
): ReSpecProperty[] {
  const result = {};
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
      + `${propertyData.cimIri}`,
    );
  }
  return result;
}


function createPropertyIdentification(
  context: AdapterContext, owner: ClassData, propertyData: PropertyData,
): string {
  return "vlastnost-"
    + sanitizeForIdentification(context, owner.humanLabel)
    + "-"
    + sanitizeForIdentification(context, propertyData.humanLabel);
}

function convertPropertyPrimitive(
  context: AdapterContext, propertyData: PropertyData,
): ReSpecTypeReference {
  const dataType = propertyData.dataTypePrimitive;
  return {
    "isPrimitive": true,
    "label": selectString(context, BASE_TYPE_NAMES[dataType]) || dataType,
    "link": dataType,
    "codelist": undefined,
    "isClassValue": undefined,
  };
}

function convertPropertyClass(
  context: AdapterContext, classData: ClassData,
): ReSpecTypeReference {
  const label = selectString(context, classData.humanLabel) || classData.psmIri;
  if (classData.isCodelist) {
    return convertPropertyClassCodeList(context, classData, label);
  }
  if (isClassValue(classData)) {
    return convertPropertyClassValue(context, classData, label);
  }

  return {
    "isPrimitive": false,
    "label": label,
    "link": createPropertyClassLink(context, classData),
    "codelist": undefined,
    "isClassValue": false,
  };
}

function createPropertyClassLink(
  context: AdapterContext,classData: ClassData
):string {
  let result = "#" + createClassIdentification(context, classData);
  if (classData.schema === undefined) {
    return result;
  }
  let schemaIri = classData.schema.psmIri;
  if (!schemaIri.endsWith("/")) {
    schemaIri += "/";
  }
  return schemaIri + "respec" + result;
}

function convertPropertyClassCodeList(
  context: AdapterContext, classData: ClassData, label: string
): ReSpecTypeReference {
  return {
    "isPrimitive": false,
    "label": label,
    // The codelist class is located in this ReSpec file.
    "link": "#" + createClassIdentification(context, classData),
    "codelist": classData.isCodelist ? classData.cimIri : undefined,
    "isClassValue": false,
  };
}

function convertPropertyClassValue(
  context: AdapterContext, classData: ClassData, label: string
): ReSpecTypeReference {
  return {
    "isPrimitive": false,
    "label": label,
    "link": getFirstNamedNode(classData.iris),
    "codelist": classData.isCodelist ? classData.cimIri : undefined,
    "isClassValue": true,
  };
}

function getFirstNamedNode(resources: string[]): string | undefined {
  for (const resource of resources) {
    if (!resource.startsWith("_")) {
      return resource;
    }
  }
  return undefined;
}

function loadReSpecExample(): ReSpecExample[] {
  return [];
}

function loadReSpecReference(): ReSpecReference {
  return new ReSpecReference();
}
