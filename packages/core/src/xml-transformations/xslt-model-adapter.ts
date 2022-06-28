import {
  StructureModelClass,
  StructureModelPrimitiveType,
  StructureModelProperty,
  StructureModelType,
  StructureModelComplexType,
  StructureModelSchemaRoot,
} from "../structure-model/model";

import {
  XmlStructureModel as StructureModel
} from "../xml-structure-model/model/xml-structure-model";

import {
  XmlTransformation,
  XmlTemplate,
  XmlRootTemplate,
  XmlMatch,
  XmlClassMatch,
  XmlLiteralMatch,
  XmlTransformationImport,
  XmlCodelistMatch,
  XmlClassTargetTemplate,
} from "./xslt-model";

import {
  DataSpecification,
  DataSpecificationArtefact,
  DataSpecificationSchema,
} from "../data-specification/model";

import { OFN } from "../well-known";
import { XSLT_LIFTING, XSLT_LOWERING } from "./xslt-vocabulary";
import { namespaceFromIri, QName, simpleTypeMapIri } from "../xml/xml-conventions";
import { pathRelative } from "../core/utilities/path-relative";
import { ArtefactGeneratorContext } from "../generator";
import { structureModelAddXmlProperties } from "../xml-structure-model/add-xml-properties";

/**
 * Converts a {@link StructureModel} to an {@link XmlTransformation}.
 */
export function structureModelToXslt(
  context: ArtefactGeneratorContext,
  specification: DataSpecification,
  artifact: DataSpecificationSchema,
  model: StructureModel
): XmlTransformation {
  const adapter = new XsltAdapter(
    context, specification, artifact, model
  );
  return adapter.fromRoots(model.roots);
}

/**
 * This class contains functions to process all parts of a {@link StructureModel}
 * and create an instance of {@link XmlTransformation}.
 */
class XsltAdapter {
  private context: ArtefactGeneratorContext;
  private specifications: { [iri: string]: DataSpecification };
  private artifact: DataSpecificationSchema;
  private model: StructureModel;
  private rdfNamespaces: Record<string, string>;
  private rdfNamespacesIris: Record<string, string>;
  private rdfNamespaceCounter: number;
  private imports: { [specification: string]: XmlTransformationImport };

  /**
   * 
   * Creates a new instance of the adapter, for a particular structure model.
   * @param context The context of generation, used to access other models.
   * @param specification The specification containing the structure model.
   * @param artifact The artifact describing the output of the generator.
   * @param model The structure model.
   */
  constructor(
    context: ArtefactGeneratorContext,
    specification: DataSpecification,
    artifact: DataSpecificationSchema,
    model: StructureModel
  ) {
    this.context = context;
    this.specifications = context.specifications;
    this.artifact = artifact;
    this.model = model;
  }

  /**
   * Produces an XSLT model from a list of root classes.
   * @param roots A list of roots to specify the desired root element templates.
   * @returns An instance of {@link XmlTransformation} with the specific roots templates.
   */
  public fromRoots(roots: StructureModelSchemaRoot[]): XmlTransformation {
    this.rdfNamespaces = {};
    this.rdfNamespacesIris = {};
    this.rdfNamespaceCounter = 0;
    this.imports = {};
    return {
      targetNamespace: this.model.namespace,
      targetNamespacePrefix: this.model.namespacePrefix,
      rdfNamespaces: this.rdfNamespaces,
      rootTemplates: roots
        .flatMap(root => root.classes)
        .map(this.rootToTemplate, this),
      templates: this.model.getClasses().map(this.classToTemplate, this)
        .filter(template => template != null),
      imports: Object.values(this.imports),
    };
  }

  findArtefactsForImport(
    classData: StructureModelClass
  ): DataSpecificationArtefact[] {
    const targetSpecification = this.specifications[classData.specification];
    if (targetSpecification == null) {
      throw new Error(`Missing specification ${classData.specification}`);
    }
    return targetSpecification.artefacts.filter(candidate => {
      if (
        candidate.generator !== XSLT_LIFTING.Generator &&
        candidate.generator !== XSLT_LOWERING.Generator
      ) {
        return false;
      }
      const candidateSchema = candidate as DataSpecificationSchema;
      if (classData.structureSchema !== candidateSchema.psm) {
        return false;
      }
      // TODO We should check that the class is root here.
      return true;
    });
  }

  /**
   * Returns true if a class is from a different schema.
   */
  classIsImported(
    classData: StructureModelClass
  ): boolean {
    return this.model.psmIri !== classData.structureSchema;
  }

  /**
   * Returns the path of the current artifact.
   */
  currentPath(): string {
    return this.artifact.publicUrl;
  }

  /**
   * Returns the {@link QName} of a class, potentially asynchronously if the
   * class is imported from a different schema, in order to load the prefix.
   */
  resolveImportedClassName(
    classData: StructureModelClass
    ): [imported: boolean, name: QName | Promise<QName>] {
    if (this.classIsImported(classData)) {
      const importDeclaration = this.imports[classData.specification];
      if (importDeclaration != null) {
        // Already imported; construct it using the prefix.
        return [true, this.getQName(importDeclaration.prefix, classData.technicalLabel)];
      }
      const artifacts = this.findArtefactsForImport(classData);
      if (artifacts.length > 0) {
        const model = this.getImportedModel(classData.structureSchema);
        // Register the import of the schema.
        const imported = this.imports[classData.specification] = {
          locations: Object.fromEntries(
            artifacts.map(
              artifact => {
                return [
                  artifact.generator,
                  pathRelative(this.currentPath(), artifact.publicUrl)
                ]
              }
            )
          ),
          prefix: this.getModelPrefix(model),
          namespace: this.getModelNamespace(model)
        };
        return [true, this.getQName(imported.prefix, classData.technicalLabel)];
      }
    }
    return [false, [this.model.namespacePrefix, classData.technicalLabel]];
  }

  /**
   * Helper function to construct a {@link QName} from an asynchronously
   * obtained prefix.
   */
  async getQName(
    prefix: Promise<string>,
    name: string
  ): Promise<QName> {
    return [await prefix, name];
  }

  /**
   * Helper function to obtain the namespace IRI of an asynchronously
   * obtained structure model.
   */
  async getModelNamespace(model: Promise<StructureModel>) {
    return (await model)?.namespace;
  }

  /**
   * Helper function to obtain the namespace prefix of an asynchronously
   * obtained structure model.
   */
  async getModelPrefix(model: Promise<StructureModel>) {
    return (await model)?.namespacePrefix;
  }

  /**
   * Returns the structure model from an imported schema.
   */
  async getImportedModel(
    iri: string
  ): Promise<StructureModel> {
    const model = this.context.structureModels[iri];
    if (model != null) {
      return await structureModelAddXmlProperties(
        model, this.context.reader
      );
    }
    return null;
  }

  /**
   * Escape characters to produce a valid NCName for a template from its
   * class's PSM IRI.
   */
  classTemplateName(classData: StructureModelClass) {
    return "_" + classData.psmIri.replace(
      /[^-.\p{L}\p{N}]/gu,
      s => "_" + s.charCodeAt(0).toString(16).padStart(4, "0")
    );
  }

  /**
   * Create a template from a root class.
   */
  rootToTemplate(classData: StructureModelClass): XmlRootTemplate {
    return {
      classIri: classData.cimIri,
      elementName: [this.model.namespacePrefix, classData.technicalLabel],
      targetTemplate: this.classTemplateName(classData),
    };
  }

  /**
   * Create a named template from a class (null for codelists).
   */
  classToTemplate(classData: StructureModelClass): XmlTemplate | null {
    if (classData.isCodelist) {
      return null;
    }
    const [imported] = this.resolveImportedClassName(classData);
    if (imported) {
      return null;
    }
    return {
      name: this.classTemplateName(classData),
      classIri: classData.cimIri,
      propertyMatches: classData.properties.map(this.propertyToMatch, this),
    }
  }

  /**
   * Produces a match from a structure model property.
   */
  propertyToMatch(
    propertyData: StructureModelProperty
  ): XmlMatch {
    let dataTypes = propertyData.dataTypes;
    if (dataTypes.length === 0) {
      throw new Error(
        `Property ${propertyData.psmIri} has no specified types.`
      );
    }
    // Enforce the same type (class or datatype)
    // for all types in the property range.
    const result =
      this.propertyToMatchCheckType(
        propertyData,
        dataTypes,
        (type) => type.isAssociation() &&
          type.dataType.isCodelist,
        this.classPropertyToCodelistMatch
      ) ??
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

  /**
   * Attempts to separate an IRI into a namespace part and a local part,
   * registers the namespace and returns a {@link QName} for use in RDF/XML.
   */
  iriToQName(iri: string): QName {
    const parts = namespaceFromIri(iri);
    if (parts == null) {
      throw new Error(
        `Cannot extract namespace from property ${iri}.`
      );
    }
    const [namespaceIri, localName] = parts;
    if (this.rdfNamespacesIris[namespaceIri] != null) {
      return [this.rdfNamespacesIris[namespaceIri], localName];
    }
    const ns = "ns" + (this.rdfNamespaceCounter++);
    this.rdfNamespaces[ns] = namespaceIri;
    this.rdfNamespacesIris[namespaceIri] = ns;
    return [ns, localName];
  }

  /**
   * Calls {@link matchConstructor} if every type in {@link dataTypes}
   * matches {@link rangeChecker}, and constructs a match from the property.
   * @param propertyData The property in the structure model.
   * @param dataTypes The datatypes used by the property.
   * @param rangeChecker The type predicate.
   * @param matchConstructor The function constructing the type.
   * @returns The match created by {@link matchConstructor}.
   */
  propertyToMatchCheckType(
    propertyData: StructureModelProperty,
    dataTypes: StructureModelType[],
    rangeChecker: (rangeType: StructureModelType) => boolean,
    matchConstructor: (
      propertyData: StructureModelProperty,
      interpretation: QName,
      propertyName: QName,
      dataTypes: StructureModelType[]
    ) => XmlMatch
  ): XmlMatch | null {
    if (dataTypes.every(rangeChecker)) {
      if (propertyData.cimIri == null) {
        throw new Error(
          `Property ${propertyData.psmIri} has no interpretation!`
        );
      }
      const interpretation = this.iriToQName(propertyData.cimIri);
      const propertyName = [
        this.model.namespacePrefix,
        propertyData.technicalLabel
      ];
      return matchConstructor.call(
        this, propertyData, interpretation, propertyName, dataTypes
      );
    }
    return null;
  }

  /**
   * Construct a class match from a class property.
   */
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
      isReverse: propertyData.isReverse,
      isDematerialized: propertyData.dematerialize,
      targetTemplates: dataTypes.map(this.classTargetTypeTemplate, this),
    };
  }

  /**
   * Create target class template information from a property's class type.
   */
  classTargetTypeTemplate(
    type: StructureModelComplexType
  ): XmlClassTargetTemplate {
    const [imported, name] = this.resolveImportedClassName(type.dataType);
    return {
      templateName: this.classTemplateName(type.dataType),
      typeName: name,
      classIri: type.dataType.cimIri,
    };
  }

  /**
   * Construct a literal match from a class property.
   */
  datatypePropertyToLiteralMatch(
    propertyData: StructureModelProperty,
    interpretation: QName,
    propertyName: QName,
    dataTypes: StructureModelPrimitiveType[]
  ): XmlLiteralMatch {
    if (dataTypes.length > 1) {
      throw new Error(
        `Multiple datatypes on a property ${propertyData.psmIri} are ` +
        "not supported."
      );
    }
    return {
      interpretation: interpretation,
      propertyIri: propertyData.cimIri,
      propertyName: propertyName,
      isReverse: propertyData.isReverse,
      dataTypeIri: this.primitiveToIri(dataTypes[0])
    };
  }

  /**
   * Construct a codelist match from a class property.
   */
  classPropertyToCodelistMatch(
    propertyData: StructureModelProperty,
    interpretation: QName,
    propertyName: QName,
    dataTypes: StructureModelComplexType[]
  ): XmlCodelistMatch {
    return {
      interpretation: interpretation,
      propertyIri: propertyData.cimIri,
      propertyName: propertyName,
      isReverse: propertyData.isReverse,
      isCodelist: true,
    };
  }

  /**
   * Obtains the datatype IRI from a primitive type.
   */
  primitiveToIri(primitiveData: StructureModelPrimitiveType): string {
    if (primitiveData.dataType == null || primitiveData.dataType == OFN.text) {
      return null;
    }
    return simpleTypeMapIri[primitiveData.dataType] ?? primitiveData.dataType;
  }
}
