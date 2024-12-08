// @ts-ignore
import { ExtendedSemanticModelRelationship, isSemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import {CoreResourceReader} from "../../core";
import {DataPsmAssociationEnd, DataPsmAttribute, DataPsmClass, DataPsmClassReference, DataPsmContainer, DataPsmExternalRoot, DataPsmInclude, DataPsmOr, DataPsmSchema,} from "../../data-psm/model";
import {StructureModel, StructureModelClass, StructureModelComplexType, StructureModelPrimitiveType, StructureModelProperty, StructureModelSchemaRoot} from "../model";
// @ts-ignore
import { Entity } from "@dataspecer/core-v2";

/**
 * Adapter that converts given schema from PIM and Data PSM models to Structure
 * Model.
 */
class StructureModelAdapter {
  private readonly reader: CoreResourceReader;

  private readonly classes: { [iri: string]: StructureModelClass };

  private psmSchemaIri: string;

  constructor(
    reader: CoreResourceReader,
    classes: { [iri: string]: StructureModelClass } | null = null,
    psmSchemaIri: string | null = null
  ) {
    this.reader = reader;
    this.classes = classes ?? {};
    this.psmSchemaIri = psmSchemaIri;
  }

  async load(psmSchemaIri: string): Promise<StructureModel | null> {
    this.psmSchemaIri = psmSchemaIri;
    const psmSchema = await this.reader.readResource(psmSchemaIri);
    if (!DataPsmSchema.is(psmSchema)) {
      return null;
    }
    const roots: StructureModelSchemaRoot[] = [];
    for (const iri of psmSchema.dataPsmRoots) {
      roots.push(await this.loadRoot(iri));
    }

    const model = new StructureModel();
    model.psmIri = psmSchema.iri;
    model.humanLabel = psmSchema.dataPsmHumanLabel;
    model.humanDescription = psmSchema.dataPsmHumanDescription;
    model.technicalLabel = psmSchema.dataPsmTechnicalLabel;
    model.roots = roots;

    return model;
  }

  async loadRoot(iri: string): Promise<StructureModelSchemaRoot> {
    const entity = await this.reader.readResource(iri);
    const root = new StructureModelSchemaRoot();
    root.psmIri = entity.iri;
    if (DataPsmOr.is(entity)) {
      for (const choiceIri of entity.dataPsmChoices) {
        const choice = await this.reader.readResource(choiceIri);
        if (!DataPsmClass.is(choice)) {
          throw new Error(`Unsupported PSM entity '${iri}' in DataPsmOr.`);
        }
        root.classes.push(await this.loadClass(choice));
        root.orTechnicalLabel = entity.dataPsmTechnicalLabel;
        root.isInOr = true;
      }
    } else if (DataPsmClass.is(entity)) {
      root.classes.push(await this.loadClass(entity));
    } else if (DataPsmExternalRoot.is(entity)) {
      root.classes.push(await this.loadExternalRoot(entity));
    } else {
      throw new Error(`Unsupported PSM root entity '${iri}'.`);
    }

    return root;
  }

  private async loadClass(
    classData: DataPsmClass | DataPsmContainer
  ): Promise<StructureModelClass> {
    // There can be a cycle in extends or properties, so we keep track
    // of what has already been loaded.
    let model = this.classes[classData.iri];
    if (model) {
      return model;
    }
    model = new StructureModelClass();
    this.classes[classData.iri] = model;
    //
    this.psmClassToModel(classData, model);
    // When loading extends we may end up in another specification,
    // to deal with that we may need to change here.
    if (DataPsmClass.is(classData)) {
      for (const iri of classData?.dataPsmExtends) {
        const part = await this.reader.readResource(iri);
        if (DataPsmClass.is(part)) {
          model.extends.push(await this.loadClass(part));
        } else if (DataPsmClassReference.is(part)) {
          const [types] = await this.loadClassReference(part);
          model.extends.push(...types);
        } else {
          throw new Error(`Unsupported PSM class extends entity '${iri}'.`);
        }
      }
    }
    for (const iri of classData.dataPsmParts) {
      const part = await this.reader.readResource(iri);
      if (DataPsmAssociationEnd.is(part)) {
        model.properties.push(await this.loadAssociationEnd(part));
      } else if (DataPsmAttribute.is(part)) {
        model.properties.push(await this.loadAttribute(part));
      } else if (DataPsmInclude.is(part)) {
        // Include is represented as extension
        const includedClass = await this.reader.readResource(part.dataPsmIncludes);
        if (DataPsmClass.is(includedClass)) {
          model.extends.push(await this.loadClass(includedClass));
        } else if (DataPsmClassReference.is(includedClass)) {
          model.extends.push(...await this.loadClassReference(includedClass)[0]);
        } else {
          throw new Error(`Unsupported PSM included entity '${iri}'.`);
        }
      } else if (DataPsmContainer.is(part)) {
        model.properties.push(await this.loadContainer(part));
      } else {
        throw new Error(`Unsupported PSM class member entity '${iri}'.`);
      }
    }
    return model;
  }

  private psmClassToModel(classData: DataPsmClass | DataPsmContainer, model: StructureModelClass) {
    model.psmIri = classData.iri;
    model.pimIri = classData.dataPsmInterpretation;
    model.humanLabel = classData.dataPsmHumanLabel;
    model.humanDescription = classData.dataPsmHumanDescription;
    model.technicalLabel = classData.dataPsmTechnicalLabel;
    model.structureSchema = this.psmSchemaIri;
    if (DataPsmClass.is(classData)) {
      model.isClosed = classData.dataPsmIsClosed;
      model.instancesHaveIdentity = classData.instancesHaveIdentity;
      model.instancesSpecifyTypes = classData.instancesSpecifyTypes;
    }
  }

  private async loadClassReference(
    classReferenceData: DataPsmClassReference
  ): Promise<[StructureModelClass[], string | null | undefined]> {
    const part = await this.reader.readResource(
      classReferenceData.dataPsmClass
    );
    // We are going to load another schema.
    const adapter = new StructureModelAdapter(
      this.reader,
      this.classes,
      classReferenceData.dataPsmSpecification
    );
    if (DataPsmClass.is(part)) {
      const model = await adapter.loadClass(part);
      const copiedModel = Object.assign(Object.create(Object.getPrototypeOf(model)), model);
      copiedModel.isReferenced = true;
      return [[copiedModel], undefined];
    } else if (DataPsmExternalRoot.is(part)) {
      const model = await adapter.loadExternalRoot(part);
      const copiedModel = Object.assign(Object.create(Object.getPrototypeOf(model)), model);
      copiedModel.isReferenced = true;
      return [[copiedModel], undefined];
    } else if (DataPsmOr.is(part)) { // todo this needs to be fixed
      const references = [];
      for (const p of part.dataPsmChoices) {
        const orPart = await this.reader.readResource(p) as DataPsmClass;
        const model = await adapter.loadClass(orPart);
        const copiedModel = Object.assign(Object.create(Object.getPrototypeOf(model)), model);
        copiedModel.isReferenced = true;
        references.push(copiedModel);
      }
      return [references, part.dataPsmTechnicalLabel];
    } else {
      throw new Error(
        `Invalid class reference '${classReferenceData.iri}' target.`
      );
    }
  }

  /**
   * Due to bad design of the structure model, the second element of the tuple
   * contains technical label of the OR. If there is no OR, the value is undefined.
   * If the OR is unnamed, the value is null.
   */
  private async loadComplexType(
    complexTypeData: DataPsmClass | DataPsmClassReference | DataPsmContainer
  ): Promise<[StructureModelComplexType[], string | null | undefined]> {
    let loadedClass: StructureModelClass[] = [];
    let label: string = undefined;
    if (DataPsmClass.is(complexTypeData) || DataPsmContainer.is(complexTypeData)) {
      loadedClass = [await this.loadClass(complexTypeData)];
    } else if (DataPsmClassReference.is(complexTypeData)) {
      [loadedClass, label] = await this.loadClassReference(complexTypeData);
    }

    return [loadedClass.map(cls => {
      const type = new StructureModelComplexType();
      type.dataType = cls;
      return type;
    }), label];
  }

  /**
   * Load an association end and the typed object it references.
   *
   * If it references a DataPsmOr, it loads the choices.
   * @param associationEndData
   * @private
   */
  private async loadAssociationEnd(
    associationEndData: DataPsmAssociationEnd
  ): Promise<StructureModelProperty> {
    const model = new StructureModelProperty();
    model.psmIri = associationEndData.iri;
    model.pimIri = associationEndData.dataPsmInterpretation;
    model.humanLabel = associationEndData.dataPsmHumanLabel;
    model.humanDescription = associationEndData.dataPsmHumanDescription;
    model.technicalLabel = associationEndData.dataPsmTechnicalLabel;
    model.dematerialize = associationEndData.dataPsmIsDematerialize === true;
    model.isReverse = associationEndData.dataPsmIsReverse === true;

    const semanticRelationship = await this.reader.readResource(
      associationEndData.dataPsmInterpretation
    ) as unknown as ExtendedSemanticModelRelationship | null;
    const end = semanticRelationship?.ends[1] ?? null; // todo
    if (end === null) {
      model.cardinalityMin = 0;
      model.cardinalityMax = null;
    } else if (isSemanticModelRelationship(semanticRelationship)) {
      model.cardinalityMin = end.cardinality?.[0] ?? 0;
      model.cardinalityMax = end.cardinality?.[1] ?? null;
    } else {
      throw new Error(
        `Invalid association end '${associationEndData.iri}' interpretation.`
      );
    }

    // The association end may point to class, class reference or "OR".
    const part = await this.reader.readResource(associationEndData.dataPsmPart);

    if (DataPsmOr.is(part)) {
      for (const choice of part.dataPsmChoices) {
        const cls = await this.reader.readResource(choice);
        if (!DataPsmClass.is(cls) && !DataPsmClassReference.is(cls)) {
          throw new Error(`Unsupported entity in OR ${choice}.`);
        }
        model.dataTypes.push(...(await this.loadComplexType(cls))[0]);
        model.orTechnicalLabel = part.dataPsmTechnicalLabel;
        model.isInOr = true;
      }
    } else if (DataPsmClass.is(part) || DataPsmClassReference.is(part)) {
      const [types, label] = await this.loadComplexType(part); // It might be a class or it might be a reference (to or for example)
      model.dataTypes.push(...types);
      model.orTechnicalLabel = label;
      model.isInOr = label !== undefined;
    } else {
      throw new Error(`Unsupported association end '${associationEndData.iri}'.`);
    }

    return model;
  }

  private async loadAttribute(
    attributeData: DataPsmAttribute
  ): Promise<StructureModelProperty> {
    const model = new StructureModelProperty();
    model.psmIri = attributeData.iri;
    model.pimIri = attributeData.dataPsmInterpretation;
    model.humanLabel = attributeData.dataPsmHumanLabel;
    model.humanDescription = attributeData.dataPsmHumanDescription;
    model.technicalLabel = attributeData.dataPsmTechnicalLabel;

    const pimAttributeData = await this.reader.readResource(
      attributeData.dataPsmInterpretation
    ) as unknown as Entity;
    if (pimAttributeData === null) {
      model.cardinalityMin = 0;
      model.cardinalityMax = null;
    } else if (isSemanticModelRelationship(pimAttributeData)) {
      model.cardinalityMin = pimAttributeData.ends[1].cardinality?.[0] ?? 0;
      model.cardinalityMax = pimAttributeData.ends[1].cardinality?.[1];
    } else {
      throw new Error(
        `Invalid attribute '${attributeData.iri}' interpretation.`
      );
    }

    const type = new StructureModelPrimitiveType();
    type.dataType = attributeData.dataPsmDatatype;
    model.dataTypes.push(type);

    return model;
  }

  private async loadContainer(
    containerData: DataPsmContainer
  ): Promise<StructureModelProperty> {
    const property = new StructureModelProperty();
    property.psmIri = containerData.iri;
    // This says that the property is actually a container
    property.propertyAsContainer = containerData.dataPsmContainerType;

    // So far the cardinality for these containers is always 1..1
    property.cardinalityMin = 1;
    property.cardinalityMax = 1;

    const [part] = await this.loadComplexType(containerData);
    property.dataTypes = part;

    return property;
  }

  /**
   * Returns StructureModelClass representing an external root. This class has
   * no members, because it is not modelled in the PSM, but for many generators
   * it is useful to ignore the concept of external root and treat it as a
   * regular class.
   */
  private async loadExternalRoot(root: DataPsmExternalRoot): Promise<StructureModelClass> {
    const model = new StructureModelClass();

    model.psmIri = root.iri;
    model.pimIri = root.dataPsmTypes[0]; // todo ignore or for now
    model.technicalLabel = root.dataPsmTechnicalLabel;
    model.structureSchema = this.psmSchemaIri;

    return model;
  }
}

export async function coreResourcesToStructuralModel(
  reader: CoreResourceReader,
  psmSchemaIri: string
): Promise<StructureModel | null> {
  const adapter = new StructureModelAdapter(reader, null);
  return await adapter.load(psmSchemaIri);
}
