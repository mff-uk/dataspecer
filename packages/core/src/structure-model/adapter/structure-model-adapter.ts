import { CoreResourceReader } from "../../core";
import {
  StructureModel,
  StructureModelClass,
  StructureModelProperty,
  StructureModelComplexType,
  StructureModelPrimitiveType,
} from "../model";
import {
  DataPsmAssociationEnd,
  DataPsmAttribute,
  DataPsmClass,
  DataPsmClassReference,
  DataPsmSchema,
} from "../../data-psm/model";
import { PimAssociationEnd, PimAttribute } from "../../pim/model";

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
    const result = new StructureModel();
    this.psmSchemaToModel(psmSchema, result);
    for (const iri of psmSchema.dataPsmRoots) {
      const part = await this.reader.readResource(iri);
      if (DataPsmClass.is(part)) {
        await this.loadClass(part);
      } else {
        throw new Error(`Unsupported PSM root entity '${iri}'.`);
      }
    }
    result.classes = { ...this.classes };
    return result;
  }

  private psmSchemaToModel(schemaData: DataPsmSchema, model: StructureModel) {
    model.psmIri = schemaData.iri;
    model.humanLabel = schemaData.dataPsmHumanLabel;
    model.humanDescription = schemaData.dataPsmHumanDescription;
    model.technicalLabel = schemaData.dataPsmTechnicalLabel;
    model.roots = schemaData.dataPsmRoots;
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

    // The association end may point to class or class reference.
    const part = await this.reader.readResource(associationEndData.dataPsmPart);
    let loadedClass: StructureModelClass;
    if (DataPsmClass.is(part)) {
      loadedClass = await this.loadClass(part);
    } else if (DataPsmClassReference.is(part)) {
      loadedClass = await this.loadClassReference(part);
    } else {
      throw new Error(
        `Unsupported PSM class extends entity ` +
          `'${associationEndData.dataPsmPart}'.`
      );
    }
    const type = new StructureModelComplexType();
    type.psmClassIri = loadedClass.psmIri;
    model.dataTypes.push(type);

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
