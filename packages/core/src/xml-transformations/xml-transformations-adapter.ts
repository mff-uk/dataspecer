import {
  StructureModelClass,
  StructureModelPrimitiveType,
  StructureModelProperty,
  StructureModel,
  StructureModelType,
  StructureModelComplexType,
} from "../structure-model";
import {
  XmlTransformation,
  XmlTemplate,
  XmlRootTemplate,
  XmlMatch,
  QName,
  XmlClassMatch,
  XmlLiteralMatch,
} from "./xml-transformations-model";

import {
  DataSpecification,
  DataSpecificationArtefact,
  DataSpecificationSchema,
} from "../data-specification/model";

import { XSD, OFN } from "../well-known";
//import { XML_SCHEMA } from "./xml-schema-vocabulary";

export function structureModelToXslt(
  specifications: { [iri: string]: DataSpecification },
  specification: DataSpecification,
  model: StructureModel
): XmlTransformation {
  const adapter = new XsltAdapter(specifications, specification, model);
  return adapter.fromRoots(model.roots);
}

const anyUriType: StructureModelPrimitiveType = (function () {
  const type = new StructureModelPrimitiveType();
  type.dataType = XSD.anyURI;
  return type;
})();

/**
 * Map from common datatype URIs to XSD datatypes.
 */
const simpleTypeMap: Record<string, string> = {
  [OFN.boolean]: XSD.boolean,
  [OFN.date]: XSD.date,
  [OFN.time]: XSD.time,
  [OFN.dateTime]: XSD.dateTimeStamp,
  [OFN.integer]: XSD.integer,
  [OFN.decimal]: XSD.decimal,
  [OFN.url]: XSD.anyURI,
  [OFN.string]: XSD.string,
};

type ClassMap = Record<string, StructureModelClass>;
class XsltAdapter {
  private classMap: ClassMap;
  private specifications: { [iri: string]: DataSpecification };
  private specification: DataSpecification;
  private model: StructureModel;
  private namespacePrefix: string;
  private rdfNamespaces: Record<string, string>;
  private rdfNamespacesIris: Record<string, string>;
  private rdfNamespaceCounter: number;

  constructor(
    specifications: { [iri: string]: DataSpecification },
    specification: DataSpecification,
    model: StructureModel
  ) {
    this.specifications = specifications;
    this.specification = specification;
    this.model = model;
    const map: ClassMap = {};
    for (const classData of Object.values(model.classes)) {
      map[classData.psmIri] = classData;
    }
    this.classMap = map;
    this.rdfNamespaces = {};
    this.rdfNamespacesIris = {};
    this.rdfNamespaceCounter = 0;
  }

  public fromRoots(roots: string[]): XmlTransformation {
    return {
      targetNamespace: null,
      targetNamespacePrefix: null,
      rdfNamespaces: this.rdfNamespaces,
      rootTemplates: roots.map(this.rootToTemplate, this),
      templates: Object.keys(this.classMap).map(this.classToTemplate, this),
    };
  }

  getClass(iri: string): StructureModelClass {
    const cls = this.classMap[iri];
    if (cls == null) {
      throw new Error(`Class ${iri} is not defined in the model.`);
    }
    return cls;
  }

  classTemplateName(classData: StructureModelClass) {
    // TODO fallback if not present
    return classData.technicalLabel;
  }

  rootToTemplate(rootIri: string): XmlRootTemplate {
    const classData = this.classMap[rootIri];
    return {
      typeIri: classData.cimIri,
      elementName: [this.namespacePrefix, classData.technicalLabel],
      targetTemplate: this.classTemplateName(classData),
    };
  }

  classToTemplate(classIri: string): XmlTemplate {
    const classData = this.classMap[classIri];
    return {
      name: this.classTemplateName(classData),
      propertyMatches: classData.properties.map(this.propertyToMatch, this),
    }
  }

  propertyToMatch(
    propertyData: StructureModelProperty
  ): XmlMatch {
    let dataTypes = propertyData.dataTypes;
    if (dataTypes.length === 0) {
      throw new Error(
        `Property ${propertyData.psmIri} has no specified types.`
      );
    }
    if (dataTypes.length > 1) {
      throw new Error(
        `Multiple datatypes on a property ${propertyData.psmIri} are ` +
        "not supported."
      );
    }
    // Treat codelists as URIs
    dataTypes = dataTypes.map(this.replaceCodelistWithUri, this);
    // Enforce the same type (class or datatype)
    // for all types in the property range.
    const result =
      this.propertyToMatchCheckType(
        propertyData,
        dataTypes,
        (type) => type.isAssociation(),
        this.classPropertyToClassMatch
      ) ??
      this.propertyToMatchCheckType(
        propertyData,
        dataTypes,
        (type) => type.isAttribute(),
        this.datatypePropertyToLiteralMatch
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

  iriToQName(iri: string): QName {
    const match = iri.match(/^(.*?)([_\p{L}][-_\p{L}\p{N}]+)$/);
    if (match == null) {
      throw new Error(
        `Cannot extract namespace from property ${iri}.`
      );
    }
    const namespaceIri = match[1];
    const localName = match[2];
    if (this.rdfNamespacesIris[namespaceIri] != null) {
      return [this.rdfNamespacesIris[namespaceIri], localName];
    }
    const ns = "ns" + (this.rdfNamespaceCounter++);
    this.rdfNamespaces[ns] = namespaceIri;
    this.rdfNamespacesIris[namespaceIri] = ns;
    return [ns, localName];
  }

  propertyToMatchCheckType(
    propertyData: StructureModelProperty,
    dataTypes: StructureModelType[],
    rangeChecker: (rangeType: StructureModelType) => boolean,
    typeConstructor: (
        propertyData: StructureModelProperty,
        interpretation: QName,
        propertyName: QName,
        dataTypes: StructureModelType[]
      ) => XmlMatch
  ): XmlMatch | null {
    if (dataTypes.every(rangeChecker)) {
      const interpretation = this.iriToQName(propertyData.cimIri);
      const propertyName = [this.namespacePrefix, propertyData.technicalLabel];
      return typeConstructor.call(
        this, interpretation, propertyName, dataTypes
      );
    }
    return null;
  }

  classPropertyToClassMatch(
    propertyData: StructureModelProperty,
    interpretation: QName,
    propertyName: QName,
    dataTypes: StructureModelComplexType[]
  ): XmlClassMatch {
    return {
      interpretation: interpretation,
      propertyIri: propertyData.cimIri,
      propertyName: propertyName,
      isDematerialized: propertyData.dematerialize,
      targetTemplate: this.classTemplateName(
        this.getClass(dataTypes[0].psmClassIri)
      ),
    };
  }

  datatypePropertyToLiteralMatch(
    propertyData: StructureModelProperty,
    interpretation: QName,
    propertyName: QName,
    dataTypes: StructureModelPrimitiveType[]
  ): XmlLiteralMatch {
    return {
      interpretation: interpretation,
      propertyIri: propertyData.cimIri,
      propertyName: propertyName,
      dataTypeIri: this.primitiveToIri(dataTypes[0])
    };
  }

  primitiveToIri(primitiveData: StructureModelPrimitiveType): string {
    if (primitiveData.dataType == null || primitiveData.dataType == OFN.text) {
      return null;
    }
    return simpleTypeMap[primitiveData.dataType] ?? primitiveData.dataType;
  }
}
