import {
  ClassData,
  PropertyData,
  SchemaData,
} from "../../entity-model/entity-model";
import {
  WebSpecification,
  WebSpecificationSchema,
  WebSpecificationEntity,
  WebSpecificationProperty,
  WebSpecificationType,
} from "./web-specification-model";

class AdapterContext {

  readonly schema: SchemaData;

  readonly stringSelector: StringSelector;

  readonly linkFactory: LinkFactory;

  constructor(
    schema: SchemaData,
    stringSelector: StringSelector,
    linkFactory: LinkFactory,
  ) {
    this.schema = schema;
    this.stringSelector = stringSelector;
    this.linkFactory = linkFactory;
  }

}

export type RootClassSelector =
  (classData: ClassData) => boolean;

export type StringSelector =
  (string: Record<string, string> | undefined) => string;

export interface LinkFactory {

  classAnchor: (classData: ClassData) => string;

  propertyAnchor: (classData: ClassData, propertyData: PropertyData) => string;

  classLink: (classData: ClassData) => string;

  codeListLink: (classData: ClassData) => string;

  valueClassLink: (classData: ClassData) => string;

}

export function webSpecification(
  schema: SchemaData,
  rootClassSelector: RootClassSelector,
  stringSelector: StringSelector,
  linkFactory: LinkFactory,
): WebSpecification {
  const context = new AdapterContext(schema, stringSelector, linkFactory);
  const classes = collectAllClassesForSchema(schema);
  const roots = selectRootClass(classes, rootClassSelector);
  return {
    "humanLabel": context.stringSelector(schema.humanLabel),
    "humanDescription": context.stringSelector(schema.humanLabel),
    "schemas": loadSpecificationSchema(context, roots),
  };
}

function collectAllClassesForSchema(
  schemaData: SchemaData): Record<string, ClassData> {
  let result: Record<string, ClassData> = {};
  for (const classData of schemaData.roots) {
    result = {
      ...result,
      ...collectAllClassesFromClass(classData),
    };
  }
  return result;
}

function collectAllClassesFromClass(
  classData: ClassData): Record<string, ClassData> {
  let result: Record<string, ClassData> = {
    [classData.psmIri]: classData,
  };
  for (const property of classData.properties) {
    for (const propertyClass of property.dataTypeClass) {
      result = {
        ...result,
        ...collectAllClassesFromClass(propertyClass),
      };
    }
  }
  return result;
}

function selectRootClass(
  classes: Record<string, ClassData>,
  rootClassSelector: RootClassSelector,
): ClassData[] {
  return Object.values(classes).filter(rootClassSelector);
}

function loadSpecificationSchema(
  context: AdapterContext, roots: ClassData [],
): WebSpecificationSchema {
  return {
    "entities": roots.map(classData =>
      loadReSpecSpecificationClassData(context, classData)),
  };
}

function loadReSpecSpecificationClassData(
  context: AdapterContext, classData: ClassData,
): WebSpecificationEntity {
  return {
    "humanLabel": context.stringSelector(classData.humanLabel),
    "humanDescription": context.stringSelector(classData.humanDescription),
    "anchor": context.linkFactory.classAnchor(classData),
    "classIri": classData.psmIri,
    "isCodelist": classData.isCodelist,
    "properties": loadClassDataProperties(context, classData),
  };
}

function loadClassDataProperties(
  context: AdapterContext, classData: ClassData,
): WebSpecificationProperty[] {
  const result = {};
  // We first load all properties based on the inheritance.
  for (const extendedClass of classData.extends) {
    for (const property of loadClassDataProperties(context, extendedClass)) {
      result[property.technicalLabel] = property;
    }
  }
  // Next we override them with this class definitions.
  for (const property of classData.properties) {
    const propertyData = convertPropertyData(context, classData, property);
    result[propertyData.technicalLabel] = propertyData;
  }
  return Object.values(result);
}

function convertPropertyData(
  context: AdapterContext, owner: ClassData, propertyData: PropertyData,
): WebSpecificationProperty {
  const result = new WebSpecificationProperty();
  result.technicalLabel = propertyData.technicalLabel;
  result.humanLabel = context.stringSelector(propertyData.humanLabel);
  result.humanDescription =
    context.stringSelector(propertyData.humanDescription);
  result.anchor = context.linkFactory.propertyAnchor(owner, propertyData);
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

function convertPropertyPrimitive(
  context: AdapterContext, propertyData: PropertyData,
): WebSpecificationType {
  const dataType = propertyData.dataTypePrimitive;
  return {
    "label": dataType,
    "isPrimitive": true,
    "isClassValue": false,
    "link": dataType,
    "codelistIri": undefined,
  };
}

function convertPropertyClass(
  context: AdapterContext, classData: ClassData,
): WebSpecificationType {
  const label = context.stringSelector(classData.humanLabel) || classData.psmIri;
  if (classData.isCodelist) {
    return convertPropertyClassCodeList(context, classData, label);
  }
  if (isClassValue(classData)) {
    return convertPropertyClassValue(context, classData, label);
  }
  return {
    "label": label,
    "isPrimitive": false,
    "isClassValue": false,
    "link": context.linkFactory.classLink(classData),
    "codelistIri": undefined,
  };
}

function convertPropertyClassCodeList(
  context: AdapterContext, classData: ClassData, label: string,
): WebSpecificationType {
  return {
    "label": label,
    "isPrimitive": false,
    "isClassValue": false,
    "link": context.linkFactory.codeListLink(classData),
    "codelistIri": classData.isCodelist ? classData.cimIri : undefined,
  };
}

/**
 * An empty class refer to an identifier, IRI for RDF, for entity
 * of the class. Such class should not be included in the list of classes.
 */
function isClassValue(classData: ClassData): boolean {
  return !classData.isCodelist && classData.properties.length === 0;
}

function convertPropertyClassValue(
  context: AdapterContext, classData: ClassData, label: string,
): WebSpecificationType {
  return {
    "label": label,
    "isPrimitive": false,
    "isClassValue": true,
    "link": context.linkFactory.valueClassLink(classData),
    "codelistIri": classData.isCodelist ? classData.cimIri : undefined,
  };
}

export function defaultRootSelector(classData: ClassData): boolean {
  if (classData.schema === undefined) {
    // Class with schema should not be included, as they
    // are in their own ReSpec files.
    return true;
  }
  if (classData.isCodelist) {
    // Codelist should be put on output always.
    return true;
  }
  return !isClassValue(classData);
}

export function defaultStringSelector(
  str: Record<string, string> | undefined): string {
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

export class DefaultLinkFactory implements LinkFactory {

  /**
   * Root schema.
   */
  readonly schema: SchemaData;

  constructor(schema: SchemaData) {
    this.schema = schema;
  }

  classAnchor(classData: ClassData): string {
    return "třída-" + this.sanitizeForAnchor(classData.humanLabel);
  }

  protected sanitizeForAnchor(content: Record<string, string>): string {
    return defaultStringSelector(content)
      .toLowerCase()
      .replace(/ /g, "-");
  }

  classLink(classData: ClassData): string {
    return this.domainLink(classData) + "#" + this.classAnchor(classData);
  }

  protected domainLink(classData: ClassData): string {
    if (classData.schema === undefined) {
      return "";
    }
    if (classData.schema === this.schema) {
      return "";
    }
    return this.schemaLink(classData.schema);
  }

  protected schemaLink(schema: SchemaData) {
    let result = schema.psmIri;
    if (!result.endsWith("/")) {
      result += "/";
    }
    result += "schema";
    return result;
  }

  codeListLink(classData: ClassData): string {
    return "#" + this.classAnchor(classData);
  }

  valueClassLink(classData: ClassData): string {
    return this.firstNamedNode(classData.iris);
  }

  protected firstNamedNode(resources: string[]): string | undefined {
    for (const resource of resources) {
      if (!resource.startsWith("_")) {
        return resource;
      }
    }
    return undefined;
  }

  propertyAnchor(classData: ClassData, propertyData: PropertyData): string {
    return "vlastnost-"
      + this.sanitizeForAnchor(classData.humanLabel)
      + "-"
      + this.sanitizeForAnchor(propertyData.humanLabel);
  }

}
