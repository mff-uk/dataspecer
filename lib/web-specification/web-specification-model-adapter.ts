import {
  ObjectModelClass,
  ObjectModelSchema,
  ObjectModelProperty,
  ObjectModelPrimitive,
  isObjectModelClass,
  isObjectModelPrimitive,
} from "../object-model";
import {
  WebSpecification,
  WebSpecificationSchema,
  WebSpecificationEntity,
  WebSpecificationProperty,
  WebSpecificationType,
} from "./web-specification-model";

class AdapterContext {

  readonly schema: ObjectModelSchema;

  readonly stringSelector: StringSelector;

  readonly linkFactory: LinkFactory;

  constructor(
    schema: ObjectModelSchema,
    stringSelector: StringSelector,
    linkFactory: LinkFactory,
  ) {
    this.schema = schema;
    this.stringSelector = stringSelector;
    this.linkFactory = linkFactory;
  }

}

export type RootClassSelector =
  (classData: ObjectModelClass) => boolean;

export type StringSelector =
  (string: Record<string, string> | undefined) => string;

export interface LinkFactory {

  classAnchor: (classData: ObjectModelClass) => string;

  propertyAnchor:
    (classData: ObjectModelClass, propertyData: ObjectModelProperty) => string;

  classLink: (classData: ObjectModelClass) => string;

  codeListLink: (classData: ObjectModelClass) => string;

  valueClassLink: (classData: ObjectModelClass) => string;

}

export function objectModelToWebSpecification(
  schema: ObjectModelSchema,
  rootClassSelector: RootClassSelector,
  stringSelector: StringSelector,
  linkFactory: LinkFactory,
): WebSpecification {
  const context = new AdapterContext(schema, stringSelector, linkFactory);
  const roots = selectRootClass(schema.classes, rootClassSelector);
  return {
    "humanLabel": context.stringSelector(schema.humanLabel),
    "humanDescription": context.stringSelector(schema.humanLabel),
    "schemas": loadSpecificationSchema(context, roots),
  };
}

function selectRootClass(
  classes: ObjectModelClass[],
  rootClassSelector: RootClassSelector,
): ObjectModelClass[] {
  return classes.filter(rootClassSelector);
}

function loadSpecificationSchema(
  context: AdapterContext, roots: ObjectModelClass [],
): WebSpecificationSchema {
  return {
    "entities": roots.map(classData =>
      loadReSpecSpecificationClassData(context, classData)),
  };
}

function loadReSpecSpecificationClassData(
  context: AdapterContext, classData: ObjectModelClass,
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
  context: AdapterContext, classData: ObjectModelClass,
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
  context: AdapterContext, owner: ObjectModelClass,
  propertyData: ObjectModelProperty,
): WebSpecificationProperty {
  const result = new WebSpecificationProperty();
  result.technicalLabel = propertyData.technicalLabel;
  result.humanLabel = context.stringSelector(propertyData.humanLabel);
  result.humanDescription =
    context.stringSelector(propertyData.humanDescription);
  result.anchor = context.linkFactory.propertyAnchor(owner, propertyData);
  for (const dataType of propertyData.dataTypes) {
    if (isObjectModelPrimitive(dataType)) {
      result.type.push(convertPropertyPrimitive(context, dataType));
    } else if (isObjectModelClass(dataType)) {
      result.type.push(convertPropertyClass(context, dataType));
    } else {
      throw new Error(
        `Invalid data type ${dataType["psmIri"]} in ${owner.psmIri}`);
    }
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
  context: AdapterContext, propertyData: ObjectModelPrimitive,
): WebSpecificationType {
  const dataType = propertyData.dataType;
  return {
    "label": dataType,
    "isPrimitive": true,
    "isClassValue": false,
    "link": dataType,
    "codelistIri": undefined,
  };
}

function convertPropertyClass(
  context: AdapterContext, classData: ObjectModelClass,
): WebSpecificationType {
  const label =
    context.stringSelector(classData.humanLabel) || classData.psmIri;
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
  context: AdapterContext, classData: ObjectModelClass, label: string,
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
function isClassValue(classData: ObjectModelClass): boolean {
  return !classData.isCodelist && classData.properties.length === 0;
}

function convertPropertyClassValue(
  context: AdapterContext, classData: ObjectModelClass, label: string,
): WebSpecificationType {
  return {
    "label": label,
    "isPrimitive": false,
    "isClassValue": true,
    "link": context.linkFactory.valueClassLink(classData),
    "codelistIri": classData.isCodelist ? classData.cimIri : undefined,
  };
}

export function defaultRootSelector(classData: ObjectModelClass): boolean {
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
  readonly schema: ObjectModelSchema;

  constructor(schema: ObjectModelSchema) {
    this.schema = schema;
  }

  classAnchor(classData: ObjectModelClass): string {
    return "třída-" + this.sanitizeForAnchor(classData.humanLabel);
  }

  protected sanitizeForAnchor(content: Record<string, string>): string {
    return defaultStringSelector(content)
      .toLowerCase()
      .replace(/ /g, "-");
  }

  classLink(classData: ObjectModelClass): string {
    return "#" + this.classAnchor(classData);
  }

  codeListLink(classData: ObjectModelClass): string {
    return "#" + this.classAnchor(classData);
  }

  valueClassLink(classData: ObjectModelClass): string {
    return this.firstNamedNode(
      [classData.psmIri, classData.pimIri, classData.cimIri]);
  }

  protected firstNamedNode(resources: string[]): string | undefined {
    for (const resource of resources) {
      if (resource === undefined || resource.startsWith("_")) {
        continue;
      }
      return resource;
    }
    return undefined;
  }

  propertyAnchor(
    classData: ObjectModelClass, propertyData: ObjectModelProperty,
  ): string {
    return "vlastnost-"
      + this.sanitizeForAnchor(classData.humanLabel)
      + "-"
      + this.sanitizeForAnchor(propertyData.humanLabel);
  }

}
