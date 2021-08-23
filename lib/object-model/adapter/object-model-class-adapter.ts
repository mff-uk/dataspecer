import {createObjectModelClass, ObjectModelClass} from "../object-model";
import {ObjectModelPropertyAdapter} from "./object-model-property-adapter";
import {CoreModelReader} from "../../core";
import {DataPsmClass, isDataPsmClass} from "../../data-psm/model";
import {isPimClass, PimClass} from "../../platform-independent-model/model";

export class ObjectModelClassAdapter {

  readonly reader: CoreModelReader;

  readonly psmClass: Record<string, ObjectModelClass> = {};

  readonly pimClass: Record<string, ObjectModelClass> = {};

  readonly propertyAdapter: ObjectModelPropertyAdapter;

  constructor(reader: CoreModelReader) {
    this.reader = reader;
    this.propertyAdapter = new ObjectModelPropertyAdapter(reader, this);
  }

  async loadClassFromPsmClass(
    dataPsmClass: DataPsmClass,
  ): Promise<ObjectModelClass> {
    if (this.psmClass[dataPsmClass.iri] !== undefined) {
      return this.psmClass[dataPsmClass.iri];
    }
    const result = createObjectModelClass();
    this.psmClass[dataPsmClass.iri] = result;
    await this.psmClassToClass(dataPsmClass, result);
    if (dataPsmClass.dataPsmInterpretation === undefined) {
      return result;
    }
    const interpretationEntity =
      await this.reader.readResource(dataPsmClass.dataPsmInterpretation);
    if (isPimClass(interpretationEntity)) {
      const interpretation =
        await this.loadClassFromPimClass(interpretationEntity);
      this.addPimInterpretation(result, interpretation);
    } else {
      throw new Error(
        ` ${interpretationEntity.iri} with types `
        + `[${interpretationEntity.types}] is not psm:Schema `
        + `interpretation for ${dataPsmClass.iri}.`);
    }
    return result;
  }

  protected async psmClassToClass(
    dataPsmClass: DataPsmClass, classData: ObjectModelClass,
  ): Promise<void> {
    classData.psmIri = dataPsmClass.iri;
    classData.technicalLabel  = dataPsmClass.dataPsmTechnicalLabel;
    classData.humanLabel = dataPsmClass.dataPsmHumanLabel;
    classData.humanDescription = dataPsmClass.dataPsmHumanDescription;
    for (const iri of dataPsmClass.dataPsmExtends) {
      const resource = await this.reader.readResource(iri);
      if (!isDataPsmClass(resource)) {
        continue;
      }
      const parentClassData = await this.loadClassFromPsmClass(resource);
      classData.extends.push(parentClassData);
    }
    classData.properties = [];
    for (const iri of dataPsmClass.dataPsmParts) {
      const resource = await this.reader.readResource(iri);
      const propertyData =
        await this.propertyAdapter.loadPropertyFromDataPsm(resource);
      classData.properties.push(...propertyData);
    }
  }

  protected addPimInterpretation(
    dataPsm: ObjectModelClass, pim: ObjectModelClass): void {
    dataPsm.cimIri = pim.cimIri;
    dataPsm.humanLabel = dataPsm.humanLabel || pim.humanLabel;
    dataPsm.humanDescription = dataPsm.humanDescription || pim.humanDescription;
    dataPsm.isCodelist = pim.isCodelist;
  }

  async loadClassFromPimClass(pimClass: PimClass): Promise<ObjectModelClass> {
    if (this.pimClass[pimClass.iri] !== undefined) {
      return this.pimClass[pimClass.iri];
    }
    const result = createObjectModelClass();
    this.pimClass[pimClass.iri] = result;
    await this.pimClassToClass(pimClass, result);
    return result;
  }

  protected async pimClassToClass(
    pimClass: PimClass, classData: ObjectModelClass,
  ): Promise<void> {
    classData.cimIri = pimClass.pimInterpretation;
    classData.pimIri = pimClass.iri;
    classData.humanLabel = pimClass.pimHumanLabel;
    classData.humanDescription = pimClass.pimHumanDescription;
    for (const iri of pimClass.pimExtends) {
      const resource = await this.reader.readResource(iri);
      if (!isPimClass(resource)) {
        continue;
      }
      const parentClassData = await this.loadClassFromPimClass(resource);
      classData.extends.push(parentClassData);
    }
    // We do not load properties here, but we may need to in future. As of
    // nbw there is no easy way how to list all properties for given class.
  }

}
