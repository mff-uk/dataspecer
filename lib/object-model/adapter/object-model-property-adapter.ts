import {CoreResourceReader, CoreResource} from "../../core";
import {
  ObjectModelPrimitive,
  ObjectModelProperty
} from "../object-model";
import {ObjectModelClassAdapter} from "./object-model-class-adapter";
import {
  DataPsmAssociationEnd,
  DataPsmAttribute,
  DataPsmClass,
} from "../../data-psm/model";
import {PimAssociation, PimAssociationEnd, PimAttribute} from "../../pim/model";
import * as PIM from "../../pim/pim-vocabulary";

export class ObjectModelPropertyAdapter {

  readonly reader: CoreResourceReader;

  readonly psmAttribute: Record<string, ObjectModelProperty> = {};

  readonly psmAssociationEnd: Record<string, ObjectModelProperty> = {};

  readonly pimAttribute: Record<string, ObjectModelProperty> = {};

  readonly pimAssociationEnd: Record<string, ObjectModelProperty> = {};

  readonly classAdapter: ObjectModelClassAdapter;

  /**
   * Once loaded holds list of all associations, we need this list
   * as we are otherwise unable to navigate from an association end
   * to the association. The key to this structure is association-end IRI.
   */
  pimAssociationForEnd: Record<string, PimAssociation> | null = null;

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
      return [await this.loadPropertyFromDataPsmAttribute(resource)];
    }
    if (DataPsmAssociationEnd.is(resource)) {
      return [await this.loadPropertyFromDataPsmAssociationEnd(resource)];
    }
    throw new Error(
      ` ${resource.iri} with types [${resource.types}] is not psm property.`);
  }

  protected async loadPropertyFromDataPsmAttribute(
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

  protected async loadPropertyFromDataPsmAssociationEnd(
    dataPsmAssociationEnd: DataPsmAssociationEnd,
  ): Promise<ObjectModelProperty> {
    if (this.psmAssociationEnd[dataPsmAssociationEnd.iri] !== undefined) {
      return this.psmAssociationEnd[dataPsmAssociationEnd.iri];
    }
    const result = new ObjectModelProperty();
    this.psmAssociationEnd[dataPsmAssociationEnd.iri] = result;
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
        await this.classAdapter.loadClassFromDataPsmClass(typeResource);
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
    propertyData.pimIri = pimAttribute.iri;
    propertyData.humanLabel = pimAttribute.pimHumanLabel;
    propertyData.humanDescription = pimAttribute.pimHumanDescription;
    propertyData.technicalLabel = pimAttribute.pimTechnicalLabel;
    // PIM level has no impact on defined types.
  }

  protected async loadPropertyFromPimAssociationEnd(
    pimAssociationEnd: PimAssociationEnd,
  ): Promise<ObjectModelProperty> {
    if (this.pimAssociationEnd[pimAssociationEnd.iri] !== undefined) {
      return this.pimAssociationEnd[pimAssociationEnd.iri];
    }
    const result = new ObjectModelProperty();
    this.pimAssociationEnd[pimAssociationEnd.iri] = result;
    this.pimAssociationEndToProperty(pimAssociationEnd, result);
    const pimAssociation = await this.loadPimAssociation(pimAssociationEnd.iri);
    if (pimAssociation === null) {
      throw new Error(`Missing association for '${pimAssociationEnd.iri}'.`);
    }
    this.pimAssociationToProperty(pimAssociation, result);
    return result;
  }

  /**
   * Load and return pim:association that own given pim:association-end.
   */
  protected async loadPimAssociation(
    associationEnd: string
  ): Promise<PimAssociation | null> {
    if (this.pimAssociationForEnd === null) {
      await this.loadPimAssociations();
    }
    return this.pimAssociationForEnd[associationEnd] ?? null;
  }

  /**
   * Collect all pim:associations to class cache.
   */
  protected async loadPimAssociations() {
    this.pimAssociationForEnd = {};
    const candidates = await this.reader.listResourcesOfType(PIM.ASSOCIATION);
    for (const iri of candidates) {
      const resource = await this.reader.readResource(iri);
      if (PimAssociation.is(resource)) {
        for (const endIri of resource.pimEnd) {
          this.pimAssociationForEnd[endIri] = resource;
        }
      } else {
        throw new Error(
          ` ${iri} with types [${resource?.types}] is not pim:Association `);
      }
    }
  }

  protected pimAssociationEndToProperty(
    pimAssociationEnd: PimAssociationEnd, propertyData: ObjectModelProperty,
  ): void {
    propertyData.pimIri = pimAssociationEnd.iri;
    propertyData.cimIri = pimAssociationEnd.pimInterpretation;
    propertyData.humanLabel = pimAssociationEnd.pimHumanLabel;
    propertyData.humanDescription = pimAssociationEnd.pimHumanDescription;
    propertyData.technicalLabel = pimAssociationEnd.pimTechnicalLabel;
    // PIM level has no impact on defined types.
  }

  protected pimAssociationToProperty(
    pimAssociationEnd: PimAssociation, propertyData: ObjectModelProperty,
  ): void {
    // Keep any value that is set, use values from association only
    // if no other is set.
    propertyData.cimIri =
      propertyData.cimIri ?? pimAssociationEnd.pimInterpretation;
    propertyData.humanLabel =
      propertyData.humanLabel ?? pimAssociationEnd.pimHumanLabel;
    propertyData.humanDescription =
      propertyData.humanDescription ?? pimAssociationEnd.pimHumanDescription;
    propertyData.technicalLabel =
      propertyData.technicalLabel ?? pimAssociationEnd.pimTechnicalLabel;
  }

}
