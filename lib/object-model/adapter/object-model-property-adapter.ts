import {CoreResourceReader, CoreResource} from "../../core";
import {ObjectModelPrimitive, ObjectModelProperty} from "../object-model";
import {ObjectModelClassAdapter} from "./object-model-class-adapter";
import {
  DataPsmAssociationEnd,
  DataPsmAttribute,
  DataPsmClass,
} from "../../data-psm/model";
import {PimAssociationEnd, PimAttribute} from "../../pim/model";

export class ObjectModelPropertyAdapter {

  readonly reader: CoreResourceReader;

  readonly psmAttribute: Record<string, ObjectModelProperty> = {};

  readonly psmAssociation: Record<string, ObjectModelProperty> = {};

  readonly pimAttribute: Record<string, ObjectModelProperty> = {};

  readonly pimAssociation: Record<string, ObjectModelProperty> = {};

  readonly classAdapter: ObjectModelClassAdapter;

  constructor(
    reader: CoreResourceReader,
    classAdapter: ObjectModelClassAdapter,
  ) {
    this.reader = reader;
    this.classAdapter = classAdapter;
  }

  async loadPropertyFromDataPsm(
    resource: CoreResource,
  ): Promise<ObjectModelProperty[]> {
    if (DataPsmAttribute.is(resource)) {
      return [await this.loadPropertyFromPsmAttribute(resource)];
    }
    if (DataPsmAssociationEnd.is(resource)) {
      return [await this.loadPropertyFromPsmAssociationEnd(resource)];
    }
    throw new Error(
      ` ${resource.iri} with types [${resource.types}] is not psm property.`);
  }

  protected async loadPropertyFromPsmAttribute(
    dataPsmAttribute: DataPsmAttribute,
  ): Promise<ObjectModelProperty> {
    if (this.psmAttribute[dataPsmAttribute.iri] !== undefined) {
      return this.psmAttribute[dataPsmAttribute.iri];
    }
    const result = new ObjectModelProperty();
    this.psmAttribute[dataPsmAttribute.iri] = result;
    // As of now we do not address the cardinality, so we leave it to default.
    this.psmAttributeToProperty(dataPsmAttribute, result);
    if (dataPsmAttribute.dataPsmInterpretation === null) {
      return result;
    }
    const interpretationEntity = await this.reader.readResource(
      dataPsmAttribute.dataPsmInterpretation);
    if (PimAttribute.is(interpretationEntity)) {
      const interpretation =
        await this.loadPropertyFromPimAttribute(interpretationEntity);
      this.addPimInterpretation(result, interpretation);
    } else {
      throw new Error(
        ` ${dataPsmAttribute.dataPsmInterpretation} with types `
        + `${interpretationEntity?.types} is not psm:Attribute `
        + `interpretation for ${dataPsmAttribute.iri}.`);
    }
    return result;
  }

  protected psmAttributeToProperty(
    dataPsmAttribute: DataPsmAttribute, propertyData: ObjectModelProperty,
  ): void {
    propertyData.psmIri = dataPsmAttribute.iri;
    propertyData.humanLabel = dataPsmAttribute.dataPsmHumanLabel;
    propertyData.humanDescription = dataPsmAttribute.dataPsmHumanDescription;
    propertyData.technicalLabel = dataPsmAttribute.dataPsmTechnicalLabel;
    //
    const dataType = new ObjectModelPrimitive();
    this.psmAttributeToPrimitive(dataPsmAttribute, dataType);
    propertyData.dataTypes.push(dataType);
  }

  protected psmAttributeToPrimitive(
    dataPsmAttribute: DataPsmAttribute, primitiveData: ObjectModelPrimitive,
  ): void {
    primitiveData.dataType = dataPsmAttribute.dataPsmDatatype;
  }

  protected addPimInterpretation(
    dataPsm: ObjectModelProperty, pim: ObjectModelProperty,
  ): void {
    dataPsm.pimIri = pim.pimIri;
    dataPsm.cimIri = pim.cimIri;
    dataPsm.humanLabel = dataPsm.humanLabel ?? pim.humanLabel;
    dataPsm.humanDescription = dataPsm.humanDescription ?? pim.humanDescription;
    dataPsm.technicalLabel = dataPsm.technicalLabel ?? pim.technicalLabel;
    // PIM level has no impact on defined types.
  }

  protected async loadPropertyFromPsmAssociationEnd(
    dataPsmAssociationEnd: DataPsmAssociationEnd,
  ): Promise<ObjectModelProperty> {
    if (this.psmAssociation[dataPsmAssociationEnd.iri] !== undefined) {
      return this.psmAssociation[dataPsmAssociationEnd.iri];
    }
    const result = new ObjectModelProperty();
    this.psmAssociation[dataPsmAssociationEnd.iri] = result;
    // As of now we do not address the cardinality, so we leave it to default.
    await this.psmAssociationEndToProperty(dataPsmAssociationEnd, result);
    if (dataPsmAssociationEnd.dataPsmInterpretation === null) {
      return result;
    }
    const interpretationEntity = await this.reader.readResource(
      dataPsmAssociationEnd.dataPsmInterpretation);
    if (PimAssociationEnd.is(interpretationEntity)) {
      const interpretation =
        await this.loadPropertyFromPimAssociationEnd(interpretationEntity);
      this.addPimInterpretation(result, interpretation);
    } else {
      throw new Error(
        ` ${dataPsmAssociationEnd.dataPsmInterpretation} with types `
        + `[${interpretationEntity?.types}] is not psm:Association `
        + `interpretation for ${dataPsmAssociationEnd.iri}.`);
    }
    return result;
  }

  protected async psmAssociationEndToProperty(
    dataPsmAssociationEnd: DataPsmAssociationEnd,
    propertyData: ObjectModelProperty,
  ): Promise<void> {
    propertyData.psmIri = dataPsmAssociationEnd.iri;
    propertyData.humanLabel = dataPsmAssociationEnd.dataPsmHumanLabel;
    propertyData.humanDescription =
      dataPsmAssociationEnd.dataPsmHumanDescription;
    propertyData.technicalLabel = dataPsmAssociationEnd.dataPsmTechnicalLabel;
    //
    const typeResource =
      await this.reader.readResource(dataPsmAssociationEnd.dataPsmPart);
    if (DataPsmClass.is(typeResource)) {
      const classType =
        await this.classAdapter.loadClassFromPsmClass(typeResource);
      propertyData.dataTypes.push(classType);
    } else {
      throw new Error(
        ` ${dataPsmAssociationEnd.dataPsmPart} with types `
        + `[${typeResource?.types}] is not psm:Class `
        + `type for ${dataPsmAssociationEnd.iri}.`);
    }
  }

  protected async loadPropertyFromPimAttribute(
    pimAttribute: PimAttribute,
  ): Promise<ObjectModelProperty> {
    if (this.pimAttribute[pimAttribute.iri] !== undefined) {
      return this.pimAttribute[pimAttribute.iri];
    }
    const result = new ObjectModelProperty();
    this.pimAttribute[pimAttribute.iri] = result;
    this.pimAttributeToProperty(pimAttribute, result);
    return result;
  }

  protected pimAttributeToProperty(
    pimAttribute: PimAttribute, propertyData: ObjectModelProperty,
  ): void {
    propertyData.cimIri = pimAttribute.pimInterpretation;
    propertyData.psmIri = pimAttribute.iri;
    propertyData.humanLabel = pimAttribute.pimHumanLabel;
    propertyData.humanDescription = pimAttribute.pimHumanDescription;
    propertyData.technicalLabel = pimAttribute.pimTechnicalLabel;
    // PIM level has no impact on defined types.
  }

  protected async loadPropertyFromPimAssociationEnd(
    pimAssociationEnd: PimAssociationEnd,
  ): Promise<ObjectModelProperty> {
    if (this.pimAssociation[pimAssociationEnd.iri] !== undefined) {
      return this.pimAssociation[pimAssociationEnd.iri];
    }
    const result = new ObjectModelProperty();
    this.pimAssociation[pimAssociationEnd.iri] = result;
    this.pimAssociationToProperty(pimAssociationEnd, result);
    return result;
  }

  protected pimAssociationToProperty(
    pimAssociationEnd: PimAssociationEnd, propertyData: ObjectModelProperty,
  ): void {
    propertyData.pimIri = pimAssociationEnd.iri;
    propertyData.cimIri = pimAssociationEnd.pimInterpretation;
    propertyData.humanLabel = pimAssociationEnd.pimHumanLabel;
    propertyData.humanDescription = pimAssociationEnd.pimHumanDescription;
    propertyData.technicalLabel = pimAssociationEnd.pimTechnicalLabel;
    // PIM level has no impact on defined types.
  }

}
