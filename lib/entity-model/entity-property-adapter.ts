import {PropertyData, PropertyType} from "./entity-model";
import {ModelResource} from "../platform-model/platform-model-api";
import {EntityClassAdapter} from "./entity-class-adapter";
import {PsmAttribute} from "../platform-model/psm/psm-attribute";
import {PsmAssociation} from "../platform-model/psm/psm-association";
import {PsmIncludes} from "../platform-model/psm/psm-includes";
import {PimAttribute} from "../platform-model/pim/pim-attribute";
import {PimAssociation} from "../platform-model/pim/pim-association";
import {CimEntity} from "../platform-model/cim/cim-entity";
import {RdfEntity} from "../rdf/rdf-api";

export class EntityPropertyAdapter {

  readonly entities: Record<string, ModelResource>;

  readonly psmAttribute: Record<string, PropertyData> = {};

  readonly psmAssociation: Record<string, PropertyData> = {};

  readonly pimAttribute: Record<string, PropertyData> = {};

  readonly pimAssociation: Record<string, PropertyData> = {};

  readonly classAdapter: EntityClassAdapter;

  constructor(
    entities: Record<string, ModelResource>,
    classAdapter: EntityClassAdapter
  ) {
    this.entities = entities;
    this.classAdapter = classAdapter;
  }

  loadPropertyFromPsm(entity: ModelResource): PropertyData[] {
    if (PsmAttribute.is(entity)) {
      return [this.loadPropertyFromPsmAttribute(entity)];
    }
    if (PsmAssociation.is(entity)) {
      return [this.loadPropertyFromPsmAssociation(entity)];
    }
    if (PsmIncludes.is(entity)) {
      return this.loadPropertyFromPsmIncludes(entity);
    }
    throw new Error(
      ` ${entity.id} with types [${entity.rdfTypes}] is not psm property.`);
  }

  protected loadPropertyFromPsmAttribute(
    entity: ModelResource
  ): PropertyData {
    if (this.psmAttribute[entity.id] !== undefined) {
      return this.psmAttribute[entity.id];
    }
    if (!PsmAttribute.is(entity)) {
      throw new Error(
        ` ${entity.id} with types [${entity.rdfTypes}] is not psm:Attribute.`);
    }
    const psmAttribute: PsmAttribute = entity as PsmAttribute;
    const result = new PropertyData();
    this.psmAttribute[entity.id] = result;
    this.psmAttributeToProperty(psmAttribute, result);
    const interpretationEntity =
      this.entities[psmAttribute.psmInterpretation];
    if (PsmAttribute.is(interpretationEntity)) {
      const interpretation =
        this.loadPropertyFromPsmAttribute(interpretationEntity);
      this.addPsmInterpretation(result, interpretation);
    } else if (PimAttribute.is(interpretationEntity)) {
      const interpretation =
        this.loadPropertyFromPimAttribute(interpretationEntity);
      this.addPimInterpretation(result, interpretation);
    } else {
      throw new Error(
        ` ${interpretationEntity.id} with types `
        + `[${interpretationEntity.rdfTypes}] is not psm:Attribute `
        + `interpretation for ${entity.id}.`);
    }
    return result;
  }

  protected psmAttributeToProperty(
    psmAttribute: PsmAttribute, propertyData: PropertyData) {
    propertyData.iris = [psmAttribute.id];
    propertyData.psmIri = psmAttribute.id;
    propertyData.humanLabel = psmAttribute.psmHumanLabel;
    propertyData.humanDescription = psmAttribute.psmHumanDescription;
    propertyData.propertyType = PropertyType.Attribute;
    propertyData.technicalLabel = psmAttribute.psmTechnicalLabel;
  }

  protected addPsmInterpretation(
    left: PropertyData, right: PropertyData
  ) {
    left.iris.push(...right.iris);
    left.cimIri = right.cimIri;
    left.humanLabel = left.humanLabel || right.humanLabel;
    left.humanDescription = left.humanDescription || right.humanDescription;
    left.technicalLabel = left.technicalLabel || right.technicalLabel;
    left.dataTypePrimitive = left.dataTypePrimitive || right.dataTypePrimitive;
    left.dataTypeClass = left.dataTypeClass || right.dataTypeClass;
  }

  protected addPimInterpretation(
    psm: PropertyData, pim: PropertyData
  ) {
    psm.iris.push(...pim.iris);
    psm.cimIri = pim.cimIri;
    psm.humanLabel = psm.humanLabel || pim.humanLabel;
    psm.humanDescription = psm.humanDescription || pim.humanDescription;
    psm.technicalLabel = psm.technicalLabel || pim.technicalLabel;
    psm.dataTypePrimitive = psm.dataTypePrimitive || pim.dataTypePrimitive;
    psm.dataTypeClass = selectNotEmpty(psm.dataTypeClass, pim.dataTypeClass);
  }

  protected loadPropertyFromPsmAssociation(
    entity: ModelResource
  ): PropertyData {
    if (this.psmAssociation[entity.id] !== undefined) {
      return this.psmAssociation[entity.id];
    }
    if (!PsmAssociation.is(entity)) {
      throw new Error(
        ` ${entity.id} with types [${entity.rdfTypes}] is not psm:Association.`);
    }
    const psmAssociation: PsmAssociation = entity as PsmAssociation;
    const result = new PropertyData();
    this.psmAssociation[entity.id] = result;
    this.psmAssociationToProperty(psmAssociation, result);
    const interpretationEntity =
      this.entities[psmAssociation.psmInterpretation];
    if (PsmAssociation.is(interpretationEntity)) {
      const interpretation =
        this.loadPropertyFromPsmAssociation(interpretationEntity);
      this.addPsmInterpretation(result, interpretation);
    } else if (PimAssociation.is(interpretationEntity)) {
      const interpretation =
        this.loadPropertyFromPimAssociation(interpretationEntity);
      this.addPimInterpretation(result, interpretation);
    } else {
      throw new Error(
        ` ${interpretationEntity.id} with types `
        + `[${interpretationEntity.rdfTypes}] is not psm:Association `
        + `interpretation for ${entity.id}.`);
    }
    return result;
  }

  protected psmAssociationToProperty(
    psmAssociation: PsmAssociation, propertyData: PropertyData) {
    propertyData.iris = [psmAssociation.id];
    propertyData.psmIri = psmAssociation.id;
    propertyData.humanLabel = psmAssociation.psmHumanLabel;
    propertyData.humanDescription = psmAssociation.psmHumanDescription;
    propertyData.propertyType = PropertyType.Association;
    propertyData.technicalLabel = psmAssociation.psmTechnicalLabel;
    propertyData.dataTypeClass = psmAssociation.psmParts
      .map(iri => this.entities[iri])
      .map(entity => this.classAdapter.loadClassFromPsmClass(entity));
  }

  protected loadPropertyFromPsmIncludes(
    entity: ModelResource
  ): PropertyData[] {
    if (!PsmIncludes.is(entity)) {
      throw new Error(
        ` ${entity.id} with types [${entity.rdfTypes}] is not psm:Includes.`);
    }
    const psmIncludes = entity as PsmIncludes;
    const result = [];
    for (const iri of psmIncludes.psmIncludes) {
      const entity = this.entities[iri];
      result.push(...this.loadPropertyFromPsm(entity))
    }
    return result;
  }

  protected loadPropertyFromPimAttribute(
    entity: ModelResource
  ): PropertyData {
    if (this.pimAttribute[entity.id] !== undefined) {
      return this.pimAttribute[entity.id];
    }
    if (!PimAttribute.is(entity)) {
      throw new Error(
        ` ${entity.id} with types [${entity.rdfTypes}] is not pim:Attribute.`);
    }
    const pimAttribute: PimAttribute = entity as PimAttribute;
    const result = new PropertyData();
    this.pimAttribute[entity.id] = result;
    this.pimAttributeToProperty(pimAttribute, result);
    const interpretation =
      this.loadPropertyFromCimIri(pimAttribute.pimInterpretation);
    this.addCimInterpretation(result, interpretation);
    return result;
  }

  protected pimAttributeToProperty(
    pimAttribute: PimAttribute, propertyData: PropertyData) {
    propertyData.iris = [pimAttribute.id];
    propertyData.psmIri = pimAttribute.id;
    propertyData.humanLabel = pimAttribute.pimHumanLabel;
    propertyData.humanDescription = pimAttribute.pimHumanDescription;
    propertyData.propertyType = PropertyType.Attribute;
    propertyData.technicalLabel = pimAttribute.pimTechnicalLabel;
    propertyData.dataTypePrimitive = pimAttribute.pimDatatype;
  }

  loadPropertyFromCimIri(iri: string): PropertyData {
    const entity = this.entities[iri];
    if (!CimEntity.is(entity)) {
      throw new Error(
        ` ${entity.id} with types [${entity.rdfTypes}] is not cim entity.`);
    }
    const result = new PropertyData();
    this.cimEntityToProperty(entity as CimEntity, result);
    return result;
  }

  protected cimEntityToProperty(
    cimEntity: CimEntity, propertyData: PropertyData
  ) {
    propertyData.iris = [cimEntity.id];
    propertyData.cimIri = cimEntity.id;
    propertyData.humanLabel = cimEntity.cimHumanLabel;
    propertyData.humanDescription = cimEntity.cimHumanDescription;
  }

  protected addCimInterpretation(
    pim: PropertyData, cim: PropertyData
  ) {
    pim.iris.push(...cim.iris);
    pim.cimIri = cim.cimIri;
    pim.humanLabel = pim.humanLabel || cim.humanLabel;
    pim.humanDescription = pim.humanDescription || cim.humanDescription;
    pim.technicalLabel = pim.technicalLabel || cim.technicalLabel;
  }

  protected loadPropertyFromPimAssociation(
    entity: ModelResource
  ): PropertyData {
    if (this.pimAssociation[entity.id] !== undefined) {
      return this.pimAssociation[entity.id];
    }
    if (!PimAssociation.is(entity)) {
      throw new Error(
        ` ${entity.id} with types [${entity.rdfTypes}] is not pim:Association.`);
    }
    const pimAssociation: PimAssociation = entity as PimAssociation;
    const result = new PropertyData();
    this.pimAssociation[entity.id] = result;
    this.pimAssociationToProperty(pimAssociation, result);
    const interpretation =
      this.loadPropertyFromCimIri(pimAssociation.pimInterpretation);
    this.addCimInterpretation(result, interpretation);
    return result;
  }

  protected pimAssociationToProperty(
    pimAssociation: PimAssociation, propertyData: PropertyData) {
    propertyData.iris = [pimAssociation.id];
    propertyData.psmIri = pimAssociation.id;
    propertyData.humanLabel = pimAssociation.pimHumanLabel;
    propertyData.humanDescription = pimAssociation.pimHumanDescription;
    propertyData.propertyType = PropertyType.Association;
    propertyData.technicalLabel = pimAssociation.pimTechnicalLabel;
    if (pimAssociation.pimEnd.length === 2) {
      const entity = this.entities[pimAssociation.pimEnd[1].pimParticipant];
      propertyData.dataTypeClass = [
        this.classAdapter.loadClassFromPimClass(entity)
      ];
    } else {
      throw new Error(
        "Missing class or ends (actual: " + pimAssociation.pimEnd.length
        + " expected: 2) for " + pimAssociation.id);
    }
  }

}

function  selectNotEmpty<T>(first: T[], second:T[]) : T[] {
  if (first === undefined || first.length === 0) {
    return second;
  }
  return first;
}
