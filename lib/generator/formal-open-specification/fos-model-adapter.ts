import {
  ClassData,
  PropertyData,
  SchemaData,
} from "../schema-model";
import {
  FormalOpenSpecification,
  FosEntity,
  FosExample,
  FosMetadata,
  FosOverview,
  FosProperty,
  FosReference,
  FosSpecification,
  FosTypeReference,
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
  const allRoots = selectRootClasses(schema);
  setSchemaToClasses(schema, allRoots);
  return {
    "url": schema.fos,
    "metadata": loadFosMetadata(context),
    "overview": loadFosOverview(context),
    "specification": loadFosSpecification(context, allRoots),
    "examples": loadFosExample(context),
    "references": loadFosReference(context),
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
      [classData.iri]: classData,
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
        [propertyClass.iri]: propertyClass,
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

function loadFosMetadata(context: AdapterContext): FosMetadata {
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

function loadFosOverview(context: AdapterContext): FosOverview {
  return new FosOverview();
}

function loadFosSpecification(
  context: AdapterContext, roots: ClassData []
): FosSpecification {
  return {
    "entities": roots.map(classData =>
      loadFosSpecificationClassData(context, classData)),
  };
}

function loadFosSpecificationClassData(
  context: AdapterContext, classData: ClassData
): FosEntity {
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
): FosProperty[] {
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
): FosProperty {
  const result = new FosProperty();
  result.technicalLabel = propertyData.technicalLabel;
  result.humanLabel = selectString(context, propertyData.humanLabel);
  result.humanDescription =
    selectString(context, propertyData.humanDescription);
  result.examples = [];
  result.relativeLink = createPropertyRelativeLink(context, propertyData);
  //
  if (propertyData.datatype !== undefined) {
    result.type.push(convertPropertyType(context, propertyData));
  }
  for (const classData of propertyData.dataTypeClass) {
    result.type.push(convertPropertyTypeClass(context, classData));
  }
  if (result.type.length === 0) {
    throw new Error(`Missing data type for ${propertyData.id}`);
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
): FosTypeReference {
  return {
    "isPrimitive": true,
    "label": selectString(context, BASE_TYPE_NAMES[propertyData.datatype])
      || propertyData.datatype,
    "schemaLink": propertyData.datatype,
    "relativeLink": "",
  };
}

function convertPropertyTypeClass(
  context: AdapterContext, classData: ClassData
): FosTypeReference {
  const label = selectString(context, classData.humanLabel) || classData.id;
  if (classData.isCodelist) {
    return {
      "isPrimitive": false,
      "label": label,
      // TODO Generate link ..
      "schemaLink": "http://example/",
      "relativeLink": "",
    };
  }
  if (classData.schema === undefined) {
    throw new Error(
      "Use of class '"
      + classData.id
      + "' without schema is not supported"
    );
  }
  return {
    "isPrimitive": false,
    "label": label,
    "schemaLink": classData.schema.fos,
    "relativeLink": createClassDataRelativeLink(context, classData),
  };
}

function loadFosExample(context: AdapterContext): FosExample[] {
  return [];
}

function loadFosReference(context: AdapterContext): FosReference {
  return new FosReference();
}
