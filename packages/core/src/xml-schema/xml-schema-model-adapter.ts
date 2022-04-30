import {
  StructureModelClass,
  StructureModelPrimitiveType,
  StructureModelProperty,
  StructureModel,
  StructureModelType,
  StructureModelComplexType,
} from "../structure-model";
import {
  XmlSchema,
  XmlSchemaComplexContent,
  XmlSchemaComplexContentElement,
  XmlSchemaComplexContentItem,
  XmlSchemaComplexGroup,
  XmlSchemaComplexType,
  XmlSchemaComplexItem,
  XmlSchemaElement,
  XmlSchemaSimpleType,
  XmlSchemaType,
  xmlSchemaTypeIsComplex,
  XmlSchemaImportDeclaration,
  XmlSchemaGroupDefinition,
  XmlSchemaAnnotation,
  XmlSchemaComplexSequence,
  XmlSchemaComplexChoice,
} from "./xml-schema-model";

import {
  DataSpecification,
  DataSpecificationArtefact,
  DataSpecificationSchema,
} from "../data-specification/model";

import { XSD } from "../well-known";
import { XML_SCHEMA } from "./xml-schema-vocabulary";

import { langStringName, QName, simpleTypeMapQName } from "../xml/xml-conventions";

export function structureModelToXmlSchema(
  specifications: { [iri: string]: DataSpecification },
  specification: DataSpecification,
  model: StructureModel
): XmlSchema {
  const options = new XmlSchemaAdapterOptions();
  options.rootClass.extractGroup = true;
  //options.rootClass.extractType = true;
  //options.otherClasses.extractGroup = true;
  //options.otherClasses.extractType = true;
  const adapter = new XmlSchemaAdapter(
    specifications, specification, model, options
  );
  return adapter.fromRoots(model.roots);
}

class ExtractOptions {
  extractType: boolean;
  extractGroup: boolean;
}

export class XmlSchemaAdapterOptions {
  rootClass: ExtractOptions;
  otherClasses: ExtractOptions;

  constructor() {
    this.rootClass = new ExtractOptions();
    this.otherClasses = new ExtractOptions();
  }
}

const anyUriType: StructureModelPrimitiveType = (function () {
  const type = new StructureModelPrimitiveType();
  type.dataType = XSD.anyURI;
  return type;
})();

const xsdNamespace = "http://www.w3.org/2001/XMLSchema#";

const iriProperty: XmlSchemaComplexContentElement = {
  cardinalityMin: 0,
  cardinalityMax: 1,
  element: {
    elementName: [null, "iri"],
    annotation: null,
    type: {
      name: ["xs", "anyURI"],
      annotation: null,
    }
  }
};

type ClassMap = Record<string, StructureModelClass>;

class XmlSchemaAdapter {
  private classMap: ClassMap;
  private usesLangString: boolean;
  private specifications: { [iri: string]: DataSpecification };
  private specification: DataSpecification;
  private model: StructureModel;
  private options: XmlSchemaAdapterOptions;

  constructor(
    specifications: { [iri: string]: DataSpecification },
    specification: DataSpecification,
    model: StructureModel,
    options: XmlSchemaAdapterOptions
  ) {
    this.specifications = specifications;
    this.specification = specification;
    this.model = model;
    this.options = options;

    const map: ClassMap = {};
    for (const classData of Object.values(model.classes)) {
      if (classData.psmIri != null) {
        map[classData.psmIri] = classData;
      }
    }
    this.classMap = map;
  }
  
  private imports: { [specification: string]: XmlSchemaImportDeclaration };
  private groups: Record<string, XmlSchemaGroupDefinition>;
  private types: Record<string, XmlSchemaType>;

  public fromRoots(roots: string[]): XmlSchema {
    this.imports = {};
    this.groups = {};
    this.types = {};
    const elements = roots
      .map(this.getClass, this)
      .map(this.classToElement, this)
      .map(this.extractGroupFromRoot, this)
      .map(this.extractTypeFromRoot, this);
    return {
      targetNamespace: null,
      targetNamespacePrefix: null,
      elements: elements,
      defineLangString: this.usesLangString,
      imports: Object.values(this.imports),
      groups: Object.values(this.groups),
      types: Object.values(this.types),
    };
  }

  extractGroupFromRoot(
    element: XmlSchemaElement
  ): XmlSchemaElement {
    if (
      this.options.rootClass.extractGroup &&
      xmlSchemaTypeIsComplex(element.type)
    ) {
      const groupName = element.elementName[1];

      this.groups[groupName] = {
        name: groupName,
        contents: [
          {
            item: element.type.complexDefinition,
            cardinalityMin: 1,
            cardinalityMax: 1,
          } as XmlSchemaComplexContentItem,
        ],
      };

      return {
        elementName: element.elementName,
        type: {
          name: element.type.name,
          annotation: element.type.annotation,
          mixed: false,
          complexDefinition: {
            xsType: "group",
            name: [null, groupName],
            contents: [],
          } as XmlSchemaComplexGroup,
        } as XmlSchemaComplexType,
        annotation: element.annotation,
      };
    }
    return element;
  }

  extractTypeFromRoot(
    element: XmlSchemaElement
  ): XmlSchemaElement {
    if (this.options.rootClass.extractType) {
      const typeName = element.elementName[1];
      const type = element.type;
      type.name = [null, typeName];
      this.types[typeName] = type;

      return {
        elementName: element.elementName,
        type: {
          name: [null, typeName],
          annotation: null
        },
        annotation: element.annotation,
      };
    }
    return element;
  }

  getClass(iri: string): StructureModelClass {
    const cls = this.classMap[iri];
    if (cls == null) {
      throw new Error(`Class ${iri} is not defined in the model.`);
    }
    return cls;
  }

  findArtefactForImport(
    classData: StructureModelClass
  ): DataSpecificationArtefact | null {
    const targetSpecification = this.specifications[classData.specification];
    if (targetSpecification == null) {
      throw new Error(`Missing specification ${classData.specification}`);
    }
    for (const candidate of targetSpecification.artefacts) {
      if (candidate.generator !== XML_SCHEMA.Generator) {
        continue;
      }
      const candidateSchema = candidate as DataSpecificationSchema;
      if (classData.structureSchema !== candidateSchema.psm) {
        continue;
      }
      // TODO We should check that the class is root here.
      return candidate;
    }
    return null;
  }

  classIsImported(
    classData: StructureModelClass
  ): boolean {
    return this.model.psmIri !== classData.structureSchema;
  }

  resolveImportedElementName(
    classData: StructureModelClass
  ): QName {
    if (this.model.psmIri !== classData.structureSchema) {
      const importDeclaration = this.imports[classData.specification];
      if (importDeclaration != null) {
        return [importDeclaration.prefix, classData.technicalLabel];
      }
      const artefact = this.findArtefactForImport(classData);
      if (artefact != null) {
        const imported = this.imports[classData.specification] = {
          namespace: null, // TODO from extension
          prefix: null, // TODO from extension
          schemaLocation: artefact.publicUrl,
        };
        return [imported.prefix, classData.technicalLabel];
      }
    }
    return [null, classData.technicalLabel];
  }

  getAnnotation(
    data: StructureModelClass | StructureModelProperty
  ): XmlSchemaAnnotation {
    const lines = [];
    if (data.cimIri != null) {
      lines.push(`Význam: ${data.cimIri}`);
    }
    if (data.humanLabel != null) {
      for (const lang of Object.keys(data.humanLabel)) {
        lines.push(`Název (${lang}): ${data.humanLabel[lang]}`);
      }
    }
    if (data.humanDescription != null) {
      for (const lang of Object.keys(data.humanDescription)) {
        lines.push(`Popis (${lang}): ${data.humanDescription[lang]}`);
      }
    }
    return lines.length == 0 ? null : {
      modelReference: data.cimIri,
      documentation: lines.join("\n")
    }
  }

  classToElement(classData: StructureModelClass): XmlSchemaElement {
    return {
      elementName: this.resolveImportedElementName(classData),
      type: {
        name: null,
        complexDefinition: this.classToComplexType(classData),
        annotation: this.getAnnotation(classData),
      } as XmlSchemaComplexType,
      annotation: null,
    };
  }

  classToComplexType(
    classData: StructureModelClass,
    extractGroup?: boolean
  ): XmlSchemaComplexItem {
    if (this.classIsImported(classData)) {
      return {
        xsType: "group",
        name: this.resolveImportedElementName(classData),
      } as XmlSchemaComplexGroup;
    }
    const contents = classData.properties.map(
      this.propertyToComplexContent, this
    );
    contents.splice(0, 0, iriProperty);
    if (extractGroup && this.options.otherClasses.extractGroup) {
      const groupName = classData.technicalLabel;

      this.groups[groupName] = {
        name: groupName,
        contents: contents,
      };

      return {
        xsType: "group",
        name: [null, groupName],
        contents: [],
      } as XmlSchemaComplexGroup;
    }
    return {
      xsType: "sequence",
      contents: contents,
    } as XmlSchemaComplexSequence;
  }

  propertyToComplexContent(
    propertyData: StructureModelProperty
  ): XmlSchemaComplexContent {
    const elementContent: XmlSchemaComplexContentElement = {
      cardinalityMin: propertyData.cardinalityMin ?? 0,
      cardinalityMax: propertyData.cardinalityMax,
      element: this.propertyToElement(propertyData),
    };
    if (propertyData.dematerialize) {
      const type = elementContent.element.type;
      if (xmlSchemaTypeIsComplex(type)) {
        return {
          cardinalityMin: elementContent.cardinalityMin,
          cardinalityMax: elementContent.cardinalityMax,
          item: type.complexDefinition,
        } as XmlSchemaComplexContentItem;
      } else {
        throw new Error(
          `Property ${propertyData.psmIri} must be of a class type ` +
            "if specified as non-materialized."
        );
      }
    }
    return elementContent;
  }

  propertyToElement(propertyData: StructureModelProperty): XmlSchemaElement {
    let dataTypes = propertyData.dataTypes;
    if (dataTypes.length === 0) {
      throw new Error(
        `Property ${propertyData.psmIri} has no specified types.`
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
        this.classPropertyToType
      ) ??
      this.propertyToElementCheckType(
        propertyData,
        dataTypes,
        type => type.isAttribute(),
        this.datatypePropertyToType
      );
    if (result == null) {
      throw new Error(
        `Property ${propertyData.psmIri} must use either only ` +
          "class types or only primitive types."
      );
    }
    return result;
  }

  replaceCodelistWithUri(dataType: StructureModelType): StructureModelType {
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
    typeConstructor: (dataTypes: StructureModelType[]) => XmlSchemaType
  ): XmlSchemaElement | null {
    if (dataTypes.every(rangeChecker)) {
      return {
        elementName: [null, propertyData.technicalLabel],
        type: typeConstructor.call(this, dataTypes),
        annotation: this.getAnnotation(propertyData),
      };
    }
    return null;
  }

  classPropertyToType(
    dataTypes: StructureModelComplexType[]
  ): XmlSchemaComplexType {
    const [defition, name] = this.classPropertyToComplexDefinition(dataTypes);
    if (name != null) {
      const type: XmlSchemaComplexType = {
        name: [null, name],
        mixed: false,
        annotation: null,
        complexDefinition: defition
      };
      this.types[name] = type;
      return type;
    }
    return {
      name: null,
      mixed: false,
      annotation: null,
      complexDefinition: defition
    };
  }

  classPropertyToComplexDefinition(
    dataTypes: StructureModelComplexType[]
  ): [XmlSchemaComplexItem, string] {
    if (dataTypes.length === 1) {
      const typeClass = this.getClass(dataTypes[0].psmClassIri);
      const name =
        this.options.otherClasses.extractType ? typeClass.technicalLabel : null;
      const classContent = this.classToComplexContent(typeClass);
      return [classContent.item, name];
    }
    return [{
      xsType: "choice",
      contents: dataTypes
        .map(dataType => this.getClass(dataType.psmClassIri))
        .map(this.classToComplexContent, this),
    } as XmlSchemaComplexChoice, null];
  }

  classToComplexContent(
    classData: StructureModelClass
  ): XmlSchemaComplexContentItem {
    return {
      item: this.classToComplexType(classData, true),
      cardinalityMin: 1,
      cardinalityMax: 1,
    };
  }

  datatypePropertyToType(
    dataTypes: StructureModelPrimitiveType[]
  ): XmlSchemaType {
    if (dataTypes.length === 1) {
      return {
        name: this.primitiveToQName(dataTypes[0]),
        annotation: null,
      };
    }
    return {
      name: null,
      annotation: null,
      simpleDefinition: {
        xsType: "union",
        contents: dataTypes.map(this.primitiveToQName, this),
      },
    } as XmlSchemaSimpleType;
  }

  primitiveToQName(primitiveData: StructureModelPrimitiveType): QName {
    if (primitiveData.dataType == null) {
      return ["xs", "anySimpleType"];
    }
    const type: QName = primitiveData.dataType.startsWith(xsdNamespace)
      ? ["xs", primitiveData.dataType.substring(xsdNamespace.length)]
      : simpleTypeMapQName[primitiveData.dataType] ?? ["xs", "anySimpleType"];
    if (type === langStringName) {
      this.usesLangString = true;
    }
    return type;
  }
}
