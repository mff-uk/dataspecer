import {
  StructureModelClass,
  StructureModelPrimitiveType,
  StructureModelProperty,
  StructureModel,
  StructureModelType, StructureModelComplexType,
} from "../structure-model";
import {
  XmlSchema,
  XmlSchemaComplexContent,
  XmlSchemaComplexContentElement,
  XmlSchemaComplexContentType,
  XmlSchemaComplexType,
  XmlSchemaComplexTypeDefinition,
  XmlSchemaElement,
  XmlSchemaSimpleType,
  XmlSchemaType,
  QName,
  langStringName,
  xmlSchemaTypeIsComplex,
} from "./xml-schema-model";

import {XSD, OFN} from "../well-known";

export function objectModelToXmlSchema(schema: StructureModel): XmlSchema {
  const adapter = new XmlSchemaAdapter(schema.classes);
  return adapter.fromRoots(schema.roots);
}

const anyUriType: StructureModelPrimitiveType = (function()
{
  const type = new StructureModelPrimitiveType();
  type.dataType = XSD.anyURI;
  return type;
})();

/**
 * Map from datatype URIs to QNames.
 */
const simpleTypeMap: Record<string, QName> = {
  [OFN.boolean]: ["xs", "boolean"],
  [OFN.date]: ["xs", "date"],
  [OFN.time]: ["xs", "time"],
  [OFN.dateTime]: ["xs", "dateTimeStamp"],
  [OFN.integer]: ["xs", "integer"],
  [OFN.decimal]: ["xs", "decimal"],
  [OFN.url]: ["xs", "anyURI"],
  [OFN.string]: ["xs", "string"],
  [OFN.text]: langStringName,
};

const xsdNamespace = "http://www.w3.org/2001/XMLSchema#";

type ClassMap = Record<string, StructureModelClass>;
class XmlSchemaAdapter {
  private classMap: ClassMap;
  private usesLangString: boolean;

  constructor(classes: { [iri: string]: StructureModelClass }) {
    const map: ClassMap = {};
    for (const classData of Object.values(classes)) {
      map[classData.psmIri] = classData;
    }
    this.classMap = map;
  }
  
  public fromRoots(
    roots: string[],
  ): XmlSchema {
    return {
      "targetNamespace": null,
      "targetNamespacePrefix": null,
      "elements": roots
        .map(this.getClass, this)
        .map(this.classToElement, this),
      "defineLangString": this.usesLangString,
      "imports": [],
    };
  }

  getClass(
    iri: string,
  ): StructureModelClass {
    const cls = this.classMap[iri];
    if (cls == null) {
      throw new Error(
        `Class ${iri} is not defined in the model.`,
      );
    }
    return cls;
  }

  classToElement(
    classData: StructureModelClass,
  ): XmlSchemaElement {
    return {
      "elementName": classData.technicalLabel,
      "type": {
        "name": null,
        "complexDefinition": this.classToComplexType(classData),
      } as XmlSchemaComplexType,
    };
  }

  classToComplexType(
    classData: StructureModelClass,
  ): XmlSchemaComplexTypeDefinition {
    return {
      "mixed": false,
      "xsType": "sequence",
      "contents": classData.properties.map(
        this.propertyToComplexContent, this,
      ),
    };
  }

  propertyToComplexContent(
    propertyData: StructureModelProperty,
  ): XmlSchemaComplexContent {
    const elementContent: XmlSchemaComplexContentElement = {
      "cardinality": {
        "min": propertyData.cardinalityMin,
        "max": propertyData.cardinalityMax,
      },
      "element": this.propertyToElement(propertyData),
    };
    if (propertyData.dematerialize) {
      const type = elementContent.element.type;
      if (xmlSchemaTypeIsComplex(type)) {
        return {
          "cardinality": elementContent.cardinality,
          "complexType": type.complexDefinition,
        } as XmlSchemaComplexContentType;
      } else {
        throw new Error(
          `Property ${propertyData.psmIri} must be of a class type `
          + "if specified as non-materialized."
        );
      }
    }
    return elementContent;
  }

  propertyToElement(
    propertyData: StructureModelProperty,
  ): XmlSchemaElement {
    let dataTypes = propertyData.dataTypes;
    if (dataTypes.length === 0) {
      throw new Error(
        `Property ${propertyData.psmIri} has no specified types.`,
      );
    }
    // Treat codelists as URIs
    dataTypes = dataTypes.map(this.replaceCodelistWithUri, this);
    // Enforce the same type (class or datatype)
    // for all types in the property range.
    const result =
    this.propertyToElementCheckType(
      propertyData,
      dataTypes,
      type => type.isAssociation(),
      this.classPropertyToComplexType)
      ??
      this.propertyToElementCheckType(
        propertyData,
        dataTypes,
        type => type.isAttribute(),
        this.datatypePropertyToSimpleType);
    if (result == null) {
      throw new Error(
        `Property ${propertyData.psmIri} must use either only `
        + "class types or only primitive types.",
      );
    }
    return result;
  }

  replaceCodelistWithUri(
    dataType: StructureModelType,
  ): StructureModelType {
    if (
      dataType.isAssociation() &&
      this.getClass(dataType.psmClassIri).isCodelist
    ) {
      return anyUriType;
    }
    return dataType;
  }

  propertyToElementCheckType(
    propertyData: StructureModelProperty,
    dataTypes: StructureModelType[],
    rangeChecker: (rangeType: StructureModelType) => boolean,
    typeConstructor: (dataTypes: StructureModelType[]) => XmlSchemaType,
  ): XmlSchemaElement | null {
    if (dataTypes.every(rangeChecker)) {
      return {
        "elementName": propertyData.technicalLabel,
        "type": typeConstructor.call(this, dataTypes),
      };
    }
    return null;
  }

  classPropertyToComplexType(
    dataTypes: StructureModelComplexType[],
  ): XmlSchemaComplexType {
    return {
      "name": null,
      "complexDefinition": {
        "mixed": false,
        "xsType": "choice",
        "contents": dataTypes
          .map(dataType => this.getClass(dataType.psmClassIri))
          .map(classData => this.classToComplexContent(classData)),
      },
    };
  }

  datatypePropertyToSimpleType(
    dataTypes: StructureModelPrimitiveType[],
  ): XmlSchemaSimpleType {
    return {
      "name": null,
      "simpleDefinition": {
        "xsType": "union",
        "contents": dataTypes.map(this.primitiveToQName, this),
      },
    };
  }

  classToComplexContent(
    classData: StructureModelClass,
  ): XmlSchemaComplexContentType {
    return {
      "complexType": this.classToComplexType(classData),
      "cardinality": null,
    };
  }

  primitiveToQName(
    primitiveData: StructureModelPrimitiveType,
  ): QName {
    if (primitiveData.dataType == null) {
      return ["xs", "anySimpleType"];
    }
    const type: QName = primitiveData.dataType.startsWith(xsdNamespace) ?
      ["xs", primitiveData.dataType.substring(xsdNamespace.length)] :
      (simpleTypeMap[primitiveData.dataType] ?? ["xs", "anySimpleType"]);
    if (type === langStringName) {
      this.usesLangString = true;
    }
    return type;
  }
}
