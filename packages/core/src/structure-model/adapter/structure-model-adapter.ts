import {CoreResourceReader} from "../../core";
import {DataPsmAssociationEnd, DataPsmAttribute, DataPsmClass, DataPsmClassReference, DataPsmInclude, DataPsmOr, DataPsmSchema,} from "../../data-psm/model";
import {PimAssociationEnd, PimAttribute} from "../../pim/model";
import {StructureModel, StructureModelClass, StructureModelComplexType, StructureModelPrimitiveType, StructureModelProperty, StructureModelSchemaRoot} from "../model";

/**
 * Adapter that converts given schema from PIM and Data PSM models to Structure
 * Model.
 */
class StructureModelAdapter {
  private readonly reader: CoreResourceReader;

  private readonly classes: { [iri: string]: StructureModelClass };

  private psmSchemaIri;

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
      }
    } else if (DataPsmClass.is(entity)) {
      root.classes.push(await this.loadClass(entity));
    } else {
      throw new Error(`Unsupported PSM root entity '${iri}'.`);
    }

    return root;
  }

  private async loadClass(
    classData: DataPsmClass
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
    for (const iri of classData.dataPsmExtends) {
      const part = await this.reader.readResource(iri);
      if (DataPsmClass.is(part)) {
        model.extends.push(await this.loadClass(part));
      } else if (DataPsmClassReference.is(part)) {
        model.extends.push(await this.loadClassReference(part));
      } else {
        throw new Error(`Unsupported PSM class extends entity '${iri}'.`);
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
          model.extends.push(await this.loadClassReference(includedClass));
        } else {
          throw new Error(`Unsupported PSM included entity '${iri}'.`);
        }
      } else {
        throw new Error(`Unsupported PSM class member entity '${iri}'.`);
      }
    }
    return model;
  }

  private psmClassToModel(classData: DataPsmClass, model: StructureModelClass) {
    model.psmIri = classData.iri;
    model.pimIri = classData.dataPsmInterpretation;
    model.humanLabel = classData.dataPsmHumanLabel;
    model.humanDescription = classData.dataPsmHumanDescription;
    model.technicalLabel = classData.dataPsmTechnicalLabel;
    model.structureSchema = this.psmSchemaIri;
  }

  private async loadClassReference(
    classReferenceData: DataPsmClassReference
  ): Promise<StructureModelClass> {
    const part = await this.reader.readResource(
      classReferenceData.dataPsmClass
    );
    if (!DataPsmClass.is(part)) {
      throw new Error(
        `Invalid class reference '${classReferenceData.iri}' target.`
      );
    }
    // We are going to load another schema.
    const adapter = new StructureModelAdapter(
      this.reader,
      this.classes,
      classReferenceData.dataPsmSpecification
    );
    return await adapter.loadClass(part);
  }

  private async loadComplexType(
    complexTypeData: DataPsmClass | DataPsmClassReference
  ): Promise<StructureModelComplexType> {
    let loadedClass: StructureModelClass;
    if (DataPsmClass.is(complexTypeData)) {
      loadedClass = await this.loadClass(complexTypeData);
    } else if (DataPsmClassReference.is(complexTypeData)) {
      loadedClass = await this.loadClassReference(complexTypeData);
    }

    const type = new StructureModelComplexType();
    type.dataType = loadedClass;
    return type;
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

    const pimAssociationEndData = await this.reader.readResource(
      associationEndData.dataPsmInterpretation
    );
    if (pimAssociationEndData === null) {
      model.cardinalityMin = 0;
      model.cardinalityMax = null;
    } else if (PimAssociationEnd.is(pimAssociationEndData)) {
      model.cardinalityMin = pimAssociationEndData.pimCardinalityMin ?? 0;
      model.cardinalityMax = pimAssociationEndData.pimCardinalityMax;
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
        model.dataTypes.push(await this.loadComplexType(cls));
      }
    } else if (DataPsmClass.is(part) || DataPsmClassReference.is(part)) {
      model.dataTypes.push(await this.loadComplexType(part));
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
    );
    if (pimAttributeData === null) {
      model.cardinalityMin = 0;
      model.cardinalityMax = null;
    } else if (PimAttribute.is(pimAttributeData)) {
      model.cardinalityMin = pimAttributeData.pimCardinalityMin ?? 0;
      model.cardinalityMax = pimAttributeData.pimCardinalityMax;
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
}

export async function coreResourcesToStructuralModel(
  reader: CoreResourceReader,
  psmSchemaIri: string
): Promise<StructureModel | null> {
  const adapter = new StructureModelAdapter(reader, null);
  return await adapter.load(psmSchemaIri);
}
