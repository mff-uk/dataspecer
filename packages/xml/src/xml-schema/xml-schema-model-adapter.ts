import { StructureModelClass, StructureModelComplexType, StructureModelPrimitiveType, StructureModelProperty, StructureModelSchemaRoot, StructureModelType, } from "@dataspecer/core/structure-model/model";
import { XmlStructureModel as StructureModel } from "../xml-structure-model/model/xml-structure-model";
import { XmlSchema, XmlSchemaAnnotation, XmlSchemaComplexContainer, XmlSchemaComplexContent, XmlSchemaComplexContentElement, xmlSchemaComplexContentIsElement, xmlSchemaComplexContentIsItem, XmlSchemaComplexContentItem, XmlSchemaComplexGroup, XmlSchemaComplexItem, XmlSchemaComplexSequence, XmlSchemaComplexType, XmlSchemaElement, XmlSchemaGroupDefinition, XmlSchemaImportDeclaration, XmlSchemaSimpleItem, XmlSchemaSimpleType, XmlSchemaType, xmlSchemaTypeIsComplex } from "./xml-schema-model";
import { DataSpecification, DataSpecificationArtefact, DataSpecificationSchema, } from "@dataspecer/core/data-specification/model";
import { OFN, XSD, XSD_PREFIX } from "@dataspecer/core/well-known";
import { XML_SCHEMA } from "./xml-schema-vocabulary";
import { pathRelative } from "@dataspecer/core/core/utilities/path-relative";
import { DataSpecificationConfiguration, DataSpecificationConfigurator, DefaultDataSpecificationConfiguration } from "@dataspecer/core/data-specification/configuration";
import { ArtefactGeneratorContext } from "@dataspecer/core/generator";
import { structureModelAddDefaultValues } from "@dataspecer/core/structure-model/transformation/add-default-values";
import { DefaultXmlConfiguration, ExtractOptions, XmlConfiguration, XmlConfigurator } from "../configuration";
import { commonXmlNamespace, commonXmlPrefix, iriElementName, langStringName, QName, simpleTypeMapQName } from "../conventions";
import { XML_COMMON_SCHEMA_GENERATOR } from "../xml-common-schema/index";
import { structureModelAddXmlProperties } from "../xml-structure-model/add-xml-properties";

function multiplyMinCardinality(a: number, b: number): number {
  return a * b;
}

function multiplyMaxCardinality(a: number | null, b: number | null): number | null {
  if (a === null || b === null) {
    return null;
  }
  return a * b;
}


/**
 * Converts a {@link StructureModel} to an {@link XmlSchema}.
 */
export async function structureModelToXmlSchema(
  context: ArtefactGeneratorContext,
  specification: DataSpecification,
  artifact: DataSpecificationSchema,
  model: StructureModel
): Promise<XmlSchema> {
  const options = XmlConfigurator.merge(DefaultXmlConfiguration, XmlConfigurator.getFromObject(artifact.configuration)) as XmlConfiguration;

  // Adds default values regarding the instancesHaveIdentity
  const globalConfiguration = DataSpecificationConfigurator.merge(
    DefaultDataSpecificationConfiguration,
    DataSpecificationConfigurator.getFromObject(artifact.configuration)
  ) as DataSpecificationConfiguration;
  model = structureModelAddDefaultValues(model, globalConfiguration) as StructureModel;

  // Find common XML artifact
  const commonXmlArtefact = specification.artefacts.find(a => a.generator === XML_COMMON_SCHEMA_GENERATOR);
  if (!commonXmlArtefact) {
    throw new Error("XML generator requires common xml schema artifact");
  }
  const commonXmlSchemaLocation = pathRelative(
    artifact.publicUrl,
    commonXmlArtefact.publicUrl,
    true // todo: we need better resolution whether the path should be absolute or not
  );

  const adapter = new XmlSchemaAdapter(
    context, specification, artifact, model, options, commonXmlSchemaLocation
  );
  return adapter.fromRoots(model.roots);
}

/**
 * The &lt;iri&gt; property defined at the beginning of every element.
 */
const iriProperty: XmlSchemaComplexContentElement = {
  cardinalityMin: 0,
  effectiveCardinalityMin: 0,
  cardinalityMax: 1,
  effectiveCardinalityMax: 1,
  semanticRelationToParentElement: null,
  element: {
    entityType: "element",
    name: iriElementName,
    annotation: null,
    type: null
  } satisfies XmlSchemaElement
};

/**
 * This class contains functions to process all parts of a {@link StructureModel}
 * and create an instance of {@link XmlSchema}.
 */
class XmlSchemaAdapter {
  private usesLangString: boolean;
  private context: ArtefactGeneratorContext;
  private specifications: { [iri: string]: DataSpecification };
  private artifact: DataSpecificationSchema;
  private model: StructureModel;
  private options: XmlConfiguration;
  private commonXmlSchemaLocation: string;

  /**
   * Creates a new instance of the adapter, for a particular structure model.
   * @param context The context of generation, used to access other models.
   * @param specification The specification containing the structure model.
   * @param artifact The artifact describing the output of the generator.
   * @param model The structure model.
   * @param options Additional options to the generator.
   */
  constructor(
    context: ArtefactGeneratorContext,
    specification: DataSpecification,
    artifact: DataSpecificationSchema,
    model: StructureModel,
    options: XmlConfiguration,
    commonXmlSchemaLocation: string,
  ) {
    this.context = context;
    this.specifications = context.specifications;
    this.artifact = artifact;
    this.model = model;
    this.options = options;
    this.commonXmlSchemaLocation = commonXmlSchemaLocation;
  }

  private imports: { [specification: string]: XmlSchemaImportDeclaration };
  private groups: Record<string, XmlSchemaGroupDefinition>;
  private types: Record<string, XmlSchemaType>;

  /**
   * Whether during the generation of the schema, the common XML schema was used and hence it needs to be imported.
   */
  private wasCommonXmlImportUsed: boolean = false;

  /**
   * Produces an XML Schema model from a list of root classes.
   * @param roots A list of roots to specify the desired root elements.
   * @returns An instance of {@link XmlSchema} with the specific root elements.
   */
  public async fromRoots(roots: StructureModelSchemaRoot[]): Promise<XmlSchema> {
    this.imports = {};
    this.groups = {};
    this.types = {};
    this.wasCommonXmlImportUsed = false;

    const elements: XmlSchemaElement[] = [];
    for (const root of roots) {
      let rootElement = await this.rootToElement(root);
      elements.push(rootElement);
    }

    if (this.wasCommonXmlImportUsed) {
      this.imports[commonXmlNamespace] = {
        namespace: commonXmlNamespace,
        prefix: commonXmlPrefix,
        schemaLocation: this.commonXmlSchemaLocation,
        model: null
      };
    }
    return {
      targetNamespace: this.model.namespace,
      targetNamespacePrefix: this.model.namespacePrefix,
      elements: elements,
      defineLangString: this.usesLangString,
      imports: Object.values(this.imports),
      groups: Object.values(this.groups),
      types: Object.values(this.types),
      commonXmlSchemaLocation: this.commonXmlSchemaLocation,
    };
  }

  /**
   * If allowed, registers the type of the root element and other elements and uses it by name.
   */
  extractTypesIfConfigured(
    rootElement: XmlSchemaElement
  ): XmlSchemaElement {
    const extractType = (element: XmlSchemaElement) => {
      const typeName = element.name[1];
      const type = element.type;
      type.name = [null, typeName];
      this.types[typeName] = type;

      element.type = {
        entityType: "type",
        name: [this.model.namespacePrefix, typeName],
        annotation: null
      };
    }
    if (this.options.rootClass.extractType) {
      extractType(rootElement);
    }
    return rootElement;
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

  /**
   * Returns true if a class is from a different schema.
   */
  classIsImported(
    classData: StructureModelClass
  ): boolean {
    return this.model.psmIri !== classData.structureSchema || classData.isReferenced;
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
  async resolveImportedClassName(
    classData: StructureModelClass
  ): Promise<QName> {
    if (this.classIsImported(classData)) {
      const importDeclaration = this.imports[classData.structureSchema];
      if (importDeclaration != null) {
        // Already imported; construct it using the prefix.
        return this.getQName(importDeclaration.prefix, classData.technicalLabel);
      }
      const artefact = this.findArtefactForImport(classData);
      if (artefact != null) {
        const model = await this.getImportedModel(classData.structureSchema);
        // Register the import of the schema.
        const imported = this.imports[classData.structureSchema] = {
          namespace: this.getModelNamespace(model),
          prefix: this.getModelPrefix(model),
          schemaLocation: pathRelative(this.currentPath(), artefact.publicUrl, classData.specification !== this.model.specification),
          model
        };
        return this.getQName(imported.prefix, classData.technicalLabel);
      }
    }
    return [null, classData.technicalLabel];
  }

  async resolveImportedOrName(
    property: StructureModelProperty
  ): Promise<QName> {
    const allClassesAreImported = property.dataTypes.every(dt => dt.isAssociation() && dt.dataType.isReferenced);
    if (allClassesAreImported) {
      const firstClass = (property.dataTypes[0] as StructureModelComplexType).dataType;

      const importDeclaration = this.imports[firstClass.structureSchema];
      if (importDeclaration != null) {
        // Already imported; construct it using the prefix.
        return this.getQName(importDeclaration.prefix, property.orTechnicalLabel);
      }
      const artefact = this.findArtefactForImport(firstClass);
      if (artefact != null) {
        const model = await this.getImportedModel(firstClass.structureSchema);
        // Register the import of the schema.
        const imported = this.imports[firstClass.structureSchema] = {
          namespace: this.getModelNamespace(model),
          prefix: this.getModelPrefix(model),
          schemaLocation: pathRelative(this.currentPath(), artefact.publicUrl, firstClass.specification !== this.model.specification),
          model
        };
        return this.getQName(imported.prefix, property.orTechnicalLabel);
      }
    }
    return [null, property.orTechnicalLabel];
  }

  /**
   * Helper function to construct a {@link QName} from an asynchronously
   * obtained prefix.
   */
  getQName(
    prefix: string,
    name: string
  ): QName {
    return [prefix, name];
  }

  /**
   * Helper function to obtain the namespace IRI of an asynchronously
   * obtained structure model.
   */
  getModelNamespace(model: StructureModel) {
    return model?.namespace ?? null;
  }

  /**
   * Helper function to obtain the namespace prefix of an asynchronously
   * obtained structure model.
   */
  getModelPrefix(model: StructureModel) {
    return model?.namespacePrefix ?? null;
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
   * Produces an {@link XmlSchemaAnnotation} from a class or property,
   * storing its interpretation, name, and description.
   */
  getAnnotation(
    data: StructureModelClass | StructureModelProperty
  ): XmlSchemaAnnotation {
    return (!data.cimIri && Object.values(data?.humanLabel ?? {}).length === 0 && Object.values(data?.humanDescription ?? {}).length === 0) ? null : {
      modelReference: data.cimIri,
      metaTitle: data.humanLabel,
      metaDescription: data.humanDescription,
      structureModelEntity: data
    }
  }

  /**
   * Produces an element description from a structure model class.
   */
  async classToElement(classData: StructureModelClass, name: string): Promise<XmlSchemaElement> {
    return {
      entityType: "element",
      name: this.classIsImported(classData) ? await this.resolveImportedClassName(classData) : [null, name],
      type: {
        entityType: "type",
        name: null,
        complexDefinition: await this.classToComplexType(
          classData,
          this.options.rootClass
        ),
        annotation: this.getAnnotation(classData),
        mixed: false,
        abstract: null,
      } satisfies XmlSchemaComplexType,
      annotation: null,
    } as XmlSchemaElement;
  }

  /**
   * Returns a single XmlSchemaElement from a root structure model.
   * Root can be either a single class or a set of classes in OR relation.
   * This does not handle the type extraction, this only returns XmlSchemaElement.
   */
  async rootToElement(root: StructureModelSchemaRoot): Promise<XmlSchemaElement> {
    const minCardinality = root.cardinalityMin ?? 1;
    const maxCardinality = root.cardinalityMax ?? 1;
    const hasWrappingElement = root.enforceCollection || minCardinality !== 1 || maxCardinality !== 1;
    const wrappingElementName = root.collectionTechnicalLabel ?? "root";

    const classes = root.classes;

    let rootElement: XmlSchemaElement;
    if (classes.length === 1 && !root.isInOr) {
      const technicalLabel = root.technicalLabel ?? classes[0].technicalLabel;
      // Single class - return the element
      rootElement = await this.classToElement(classes[0], technicalLabel);
    } else {
      const [el] = await this.oRToSingleType(classes, true, undefined, undefined, root.isInOr);
      const complexType = {
        entityType: "type",
        //name: [null, root.orTechnicalLabel],
        name: null,
        complexDefinition: el,
        annotation: null,
      } as XmlSchemaComplexType;
      //!this.types[root.orTechnicalLabel] = complexType;

      // Return element that references the type even if the type is not extracted
      // todo this is weird.
      let rootElement = {
        entityType: "element",
        name: [null, root.technicalLabel ?? root.orTechnicalLabel],
        type: complexType,
        annotation: null,
      } as XmlSchemaElement;
    }

    rootElement = this.extractTypesIfConfigured(rootElement);

    if (hasWrappingElement) {
      const complexContent = {
        cardinalityMin: minCardinality,
        cardinalityMax: maxCardinality,
        element: rootElement,
        semanticRelationToParentElement: null,
        effectiveCardinalityMax: maxCardinality,
        effectiveCardinalityMin: minCardinality
      } satisfies XmlSchemaComplexContentElement;

      const type = {
        entityType: "type",
        name: null, // This type is not need to be extracted
        complexDefinition: {
          xsType: "sequence",
          contents: [complexContent]
        } as XmlSchemaComplexSequence,
        mixed: false,
        abstract: null,
        annotation: null
      } satisfies XmlSchemaComplexType;

      const wrappingElement = {
        entityType: "element",
        name: [null, wrappingElementName],
        type: type,
        annotation: null
      } as XmlSchemaElement;

      return wrappingElement;
    } else {
      return rootElement;
    }
  }

  /**
   * Produces a complex type from a structure model class.
   * @param classData The class from the structure model.
   * @param extractOptions The extraction options for this class.
   * @param skipIri True whether to omit &lt;iri&gt; in the result.
   */
  async classToComplexType(
    classData: StructureModelClass,
    extractOptions: ExtractOptions,
    skipIri?: boolean
  ): Promise<XmlSchemaComplexItem> {
    skipIri ||= classData.instancesHaveIdentity === "NEVER";
    skipIri ||= classData.cimIri === null;
    if (this.classIsImported(classData)) {
      // For an imported type, construct a reference to its group.
      const name = await this.resolveImportedClassName(classData);
      const groupRef: XmlSchemaComplexGroup = {
        xsType: "group",
        name: name,
        referencesStructure: classData.structureSchema,
      };
      if (skipIri) {
        return groupRef;
      } else {
        return this.getIriSequence(groupRef);
      }
    }
    const contents = await Promise.all(classData.properties.map(
      this.propertyToComplexContent, this
    ));
    const contentsSequence: XmlSchemaComplexSequence = {
      xsType: "sequence",
      contents: contents,
    };
    if (extractOptions.extractGroup) {
      // If extraction is enabled, define the group and return its reference.
      const groupName = classData.technicalLabel;

      this.groups[groupName] = {
        entityType: "groupDefinition",
        name: [null, groupName],
        definition: contentsSequence,
      } as XmlSchemaGroupDefinition;

      const groupRef: XmlSchemaComplexGroup = {
        xsType: "group",
        name: [this.model.namespacePrefix, groupName],
        referencesStructure: null,
      };
      if (skipIri) {
        return groupRef;
      } else {
        return this.getIriSequence(groupRef);
      }
    }
    if (!skipIri) {
      contents.splice(0, 0, iriProperty);
      this.wasCommonXmlImportUsed = true;
    }
    return contentsSequence;
  }

  /**
   * Constructs the sequence of {@link iriProperty} and another item.
   */
  getIriSequence(item: XmlSchemaComplexItem): XmlSchemaComplexSequence {
    this.wasCommonXmlImportUsed = true;
    const content: XmlSchemaComplexContentItem = {
      cardinalityMax: 1,
      cardinalityMin: 1,
      item: item
    };
    return {
      xsType: "sequence",
      contents: [
        iriProperty,
        content
      ],
    };
  }

  /**
   * Produces a complex content item from a property.
   *
   * Produces for example:
   *  - <xs:element minOccurs="0" maxOccurs="unbounded" name="capacity" type="xs:string"/>
   *  - <xs:sequence>...</xs:sequence>
   */
  async propertyToComplexContent(
    propertyData: StructureModelProperty
  ): Promise<XmlSchemaComplexContent> {
    const elementContent: XmlSchemaComplexContentElement = {
      cardinalityMin: propertyData.cardinalityMin ?? 0,
      cardinalityMax: propertyData.cardinalityMax,
      effectiveCardinalityMin: propertyData.cardinalityMin ?? 0,
      effectiveCardinalityMax: propertyData.cardinalityMax,
      semanticRelationToParentElement: propertyData.semanticPath ?? [], // It is a relation from complex content to this relation
      element: await this.propertyToElement(propertyData),
    };
    if (propertyData.dematerialize || propertyData.propertyAsContainer) {
      const type = elementContent.element.type;
      if (xmlSchemaTypeIsComplex(type)) {
        // A dematerialized property item is its type definition.
        const item: XmlSchemaComplexContentItem = {
          cardinalityMin: elementContent.cardinalityMin,
          cardinalityMax: elementContent.cardinalityMax,
          item: type.complexDefinition,
        };

        // Propagate effective cardinality by finding all elements
        const lookupContents = [...(item.item as XmlSchemaComplexContainer)?.contents];
        for (const content of lookupContents) {
          if (xmlSchemaComplexContentIsElement(content)) {
            content.effectiveCardinalityMin = multiplyMinCardinality(
              content.effectiveCardinalityMin,
              item.cardinalityMin
            );
            content.effectiveCardinalityMax = multiplyMaxCardinality(
              content.effectiveCardinalityMax,
              item.cardinalityMax
            );
          } else if (xmlSchemaComplexContentIsItem(content)) {
            const lookup = [...(content.item as XmlSchemaComplexContainer)?.contents];
            lookupContents.push(...lookup);
          }
        }

        // This will take the constructed item and changes the container type
        if (propertyData.propertyAsContainer) {
          item.item.xsType = propertyData.propertyAsContainer as string;
        }

        return item;
      } else {
        throw new Error(
          `Property ${propertyData.psmIri} must be of a class type ` +
            "if specified as non-materialized."
        );
      }
    }
    return elementContent;
  }

  /**
   * Produces an element definition from a property.
   */
  async propertyToElement(propertyData: StructureModelProperty): Promise<XmlSchemaElement> {
    let dataTypes = propertyData.dataTypes;
    if (dataTypes.length === 0) {
      throw new Error(
        `Property ${propertyData.psmIri} has no specified types.`
      );
    }

    const everyClassIsReferenced = propertyData.dataTypes.every(dt => dt.isAssociation() && dt.dataType.isReferenced);

    if (everyClassIsReferenced && propertyData.orTechnicalLabel) {
      return {
        entityType: "element",
        name: [null, propertyData.technicalLabel],
        semanticRelationToParentElement: null,
        type: {
          entityType: "type",
          name: await this.resolveImportedOrName(propertyData),
          annotation: null,
          simpleDefinition: null,
        } satisfies XmlSchemaSimpleType,
        annotation: this.getAnnotation(propertyData),
      } as XmlSchemaElement;
    }

    // Treat codelists as URIs
    dataTypes = dataTypes.map(this.replaceCodelistWithUri, this);
    // Enforce the same type (class or datatype)
    // for all types in the property range.
    const result =
      await this.propertyToElementCheckType(
        propertyData,
        dataTypes,
        type => type.isAssociation(),
        this.classPropertyToType
      ) ??
      await this.propertyToElementCheckType(
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

  /**
   * Replaces a codelist datatype.
   */
  replaceCodelistWithUri(dataType: StructureModelType): StructureModelType {
    if (
      dataType.isAssociation() &&
      dataType.dataType.isCodelist
    ) {
      const type = new StructureModelPrimitiveType();
      type.dataType = XSD.anyURI;
      type.regex = dataType.dataType.regex;
      return type;
    }
    return dataType;
  }

  /**
   * Calls {@link typeConstructor} if every type in {@link dataTypes}
   * matches {@link rangeChecker}, and constructs an element from the property.
   * @param propertyData The property in the structure model.
   * @param dataTypes The datatypes used by the property.
   * @param rangeChecker The type predicate.
   * @param typeConstructor The function constructing the type.
   * @returns The element with the type created by {@link typeConstructor}.
   */
  async propertyToElementCheckType(
    propertyData: StructureModelProperty,
    dataTypes: StructureModelType[],
    rangeChecker: (rangeType: StructureModelType) => boolean,
    typeConstructor: (
      propertyData: StructureModelProperty,
      dataTypes: StructureModelType[]
    ) => Promise<XmlSchemaType>
  ): Promise<XmlSchemaElement | null> {
    if (dataTypes.every(rangeChecker)) {
      return {
        entityType: "element",
        name: [null, propertyData.technicalLabel],
        type: await typeConstructor.call(this, propertyData, dataTypes),
        annotation: this.getAnnotation(propertyData),
      } as XmlSchemaElement;
    }
    return null;
  }

  /**
   * Creates a complex type from a class property.
   */
  async classPropertyToType(
    propertyData: StructureModelProperty,
    dataTypes: StructureModelComplexType[]
  ): Promise<XmlSchemaComplexType> {
    const [definition, name, abstract] = await this.classPropertyToComplexDefinition(
      propertyData, dataTypes
    );
    const dataTypeAnnotation = this.getAnnotation(dataTypes[0].dataType);
    if (name != null) {
      // The type has a name; define it and use its name.
      const complexType: XmlSchemaComplexType = {
        entityType: "type",
        name: [null, name],
        mixed: false,
        abstract: abstract,
        annotation: dataTypeAnnotation,
        complexDefinition: definition
      };
      this.types[name] = complexType;
      return {
        entityType: "type",
        name: [this.model.namespacePrefix, name],
        mixed: false,
        abstract: abstract,
        annotation: dataTypeAnnotation,
        complexDefinition: definition
      };
    }
    return {
      entityType: "type",
      name: null,
      mixed: false,
      abstract: abstract,
      annotation: dataTypeAnnotation,
      complexDefinition: definition
    };
  }

  /**
   * Produces a complex type definition from a class property, and other
   * information for its complex content item.
   */
  async classPropertyToComplexDefinition(
    propertyData: StructureModelProperty,
    dataTypes: StructureModelComplexType[]
  ): Promise<[definition: XmlSchemaComplexItem, name: string, abstract: boolean]> {
    const skipIri: boolean = propertyData.dematerialize;

    const [el, name] = await this.oRToSingleType(dataTypes.map(t => t.dataType) , true, skipIri, propertyData.orTechnicalLabel, propertyData.isInOr);

    return [el, name, false];
  }

  /**
   * Converts multiple classes in OR relation to a single type.
   * The second argument specifies whether the or is exclusive or not.
   */
  async oRToSingleType(
    classes: StructureModelClass[],
    exclusive: boolean,
    skipIri?: boolean,
    orTechnicalLabel?: string,
    isInOr?: boolean,
  ): Promise<[XmlSchemaComplexItem, string | null]> {
    if (classes.length === 1 && !isInOr) {
      const typeClass = classes[0];
      const name =
        this.options.otherClasses.extractType ? typeClass.technicalLabel : null;
      const classItem = await this.classToComplexType(
        typeClass, this.options.otherClasses, skipIri
      );
      return [classItem, name];
    }

    const everyClassIsReferenced = classes.every(c => c.isReferenced);
    if (everyClassIsReferenced && orTechnicalLabel) {
      return [{
        xsType: "choice",
        contents: [{
          cardinalityMin: 1,
          cardinalityMax: 1,
          semanticRelationToParentElement: null,
          element: {
            elementName: [null, orTechnicalLabel],
            annotation: null,
            type: null
          }
        } as XmlSchemaComplexContent]
      } as XmlSchemaComplexContainer, null];
    }

    const root = {
      xsType: exclusive ? "choice" : "sequence",
      contents: []
    } as XmlSchemaComplexContainer;

    for (const classData of classes) {
      if (!classData.isReferenced) {
        const definition = await this.classToComplexType(
          classData, this.options.otherClasses, skipIri
        );
        const complexType: XmlSchemaComplexType = {
          entityType: "type",
          name: [null, classData.technicalLabel],
          mixed: false,
          abstract: false,
          annotation: this.getAnnotation(classData),
          complexDefinition: definition
        };

        this.types[classData.technicalLabel] = complexType;
      }
      root.contents.push({
        cardinalityMin: 1,
        cardinalityMax: 1,
        element: {
          entityType: "element",
          name: [null, classData.technicalLabel],
          annotation: null,
          type: {
            name: [this.model.namespacePrefix, classData.technicalLabel],
            annotation: null
          }
        } as XmlSchemaElement
      } as XmlSchemaComplexContentElement);
    }

    return [root, null];
  }

  /**
   * Creates a simple type from a datatype property.
   */
  async datatypePropertyToType(
    propertyData: StructureModelProperty,
    dataTypes: StructureModelPrimitiveType[]
  ): Promise<XmlSchemaType> {
    if (dataTypes.length === 1 && !propertyData.isInOr) {
      if (dataTypes[0].regex && [OFN.string, XSD.anyURI].includes(dataTypes[0].dataType)) { // todo: check whether regex is shown
        return {
          name: null,
          annotation: null,
          simpleDefinition: {
            xsType: "restriction",
            base: this.primitiveToQName(dataTypes[0]),
            pattern: dataTypes[0].regex,
            contents: []
          } as XmlSchemaSimpleItem,
        } as XmlSchemaSimpleType;
      };

      return {
        entityType: "type",
        name: this.primitiveToQName(dataTypes[0]),
        annotation: null, // No annotation for primitive types.
      };
    }
    // Use the union of all the datatypes.
    const simpleType: XmlSchemaSimpleType = {
      entityType: "type",
      name: null,
      annotation: null,
      simpleDefinition: {
        xsType: "union",
        contents: dataTypes.map(this.primitiveToQName, this),
      },
    };
    return simpleType;
  }

  /**
   * Obtains the {@link QName} corresponding to a primitive type.
   */
  primitiveToQName(primitiveData: StructureModelPrimitiveType): QName {
    if (primitiveData.dataType == null) {
      // No type defined.
      return ["xs", "anySimpleType"];
    }
    const type: QName = primitiveData.dataType.startsWith(XSD_PREFIX)
      // Type inside XSD is used.
      ? ["xs", primitiveData.dataType.substring(XSD_PREFIX.length)]
      // An interally mapped type (from OFN) is used, if defined.
      : simpleTypeMapQName[primitiveData.dataType] ?? ["xs", "anySimpleType"];
    if (type === langStringName) {
      // Defined langString if it is used.
      this.usesLangString = true;
      if (type[0] == null) {
        return [this.model.namespacePrefix, type[1]];
      }
    }
    return type;
  }
}
