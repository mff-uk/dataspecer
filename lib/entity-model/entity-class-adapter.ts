import {ModelResource} from "../platform-model/platform-model-api";
import {ClassData} from "./entity-model";
import {PimClass} from "../platform-model/pim/pim-class";
import {PsmClass} from "../platform-model/psm/psm-class";
import {EntityPropertyAdapter} from "./entity-property-adapter";
import {EntitySchemaAdapter} from "./entity-schema-adapter";
import {CimEntity} from "../platform-model/cim/cim-entity";

export class EntityClassAdapter {

  readonly entities: Record<string, ModelResource>;

  readonly psmClass: Record<string, ClassData> = {};

  readonly pimClass: Record<string, ClassData> = {};

  readonly schemaAdapter: EntitySchemaAdapter;

  readonly propertyAdapter: EntityPropertyAdapter;

  constructor(
    entities: Record<string, ModelResource>,
    schemaAdapter: EntitySchemaAdapter
  ) {
    this.entities = entities;
    this.schemaAdapter = schemaAdapter;
    this.propertyAdapter = new EntityPropertyAdapter(entities, this);
  }

  loadClassFromPsmClass(entity: ModelResource): ClassData {
    if (this.psmClass[entity.id] !== undefined) {
      return this.psmClass[entity.id];
    }
    if (!PsmClass.is(entity)) {
      throw new Error(
        ` ${entity.id} with types [${entity.rdfTypes}] is not psm:Class.`);
    }
    const psmClass = entity as PsmClass;
    const result = new ClassData();
    this.psmClass[entity.id] = result;
    this.psmClassToClass(psmClass, result);
    const interpretationEntity = this.entities[psmClass.psmInterpretation];
    if (PsmClass.is(interpretationEntity)) {
      const interpretation = this.loadClassFromPsmClass(interpretationEntity);
      this.addPsmInterpretation(result, interpretation);
    } else if (PimClass.is(interpretationEntity)) {
      const interpretation = this.loadClassFromPimClass(interpretationEntity);
      this.addPimInterpretation(result, interpretation);
    } else {
      throw new Error(
        ` ${interpretationEntity.id} with types `
        + `[${interpretationEntity.rdfTypes}] is not psm:Schema `
        + `interpretation for ${entity.id}.`);
    }
    return result;
  }

  protected psmClassToClass(psmClass: PsmClass, classData: ClassData) {
    classData.psmIri = psmClass.id;
    classData.humanLabel = psmClass.psmHumanLabel;
    classData.humanDescription = psmClass.psmHumanDescription;
    classData.extends = psmClass.psmExtends
      .map(iri => this.entities[iri])
      .map(entity => this.loadClassFromPsmClass(entity));
    classData.properties = [];
    for (const iri of psmClass.psmParts) {
      const entity = this.entities[iri];
      classData.properties.push(
        ...this.propertyAdapter.loadPropertyFromPsm(entity));
    }
    classData.schema = this.schemaAdapter.loadPsmSchemaFromIri(
      psmClass.ownerSchema);
  }

  protected addPsmInterpretation(left: ClassData, right: ClassData) {
    left.cimIri = right.cimIri;
    left.humanLabel = left.humanLabel || right.humanLabel;
    left.humanDescription = left.humanDescription || right.humanDescription;
    left.extends = left.extends || right.extends;
    left.properties = left.properties || right.properties;
    left.schema = left.schema || right.schema;
  }

  protected addPimInterpretation(psm: ClassData, pim: ClassData) {
    psm.cimIri = pim.cimIri;
    psm.humanLabel = psm.humanLabel || pim.humanLabel;
    psm.humanDescription = psm.humanDescription || pim.humanDescription;
  }

  loadClassFromPimClass(entity: ModelResource): ClassData {
    if (this.pimClass[entity.id] !== undefined) {
      return this.pimClass[entity.id];
    }
    if (!PimClass.is(entity)) {
      throw new Error(
        ` ${entity.id} with types [${entity.rdfTypes}] is not pim:Class.`);
    }
    const pimClass = entity as PimClass;
    const result = new ClassData();
    this.pimClass[entity.id] = result;
    this.pimClassToClass(pimClass, result);
    const interpretation = this.loadClassFromCimIri(pimClass.pimInterpretation);
    this.addCimInterpretation(result, interpretation);
    return result;
  }

  protected addCimInterpretation(pim: ClassData, cim: ClassData) {
    pim.cimIri = cim.cimIri;
    pim.humanLabel = pim.humanLabel || cim.humanLabel;
    pim.humanDescription = pim.humanDescription || cim.humanDescription;
  }

  protected pimClassToClass(pimClass: PimClass, classData: ClassData) {
    classData.humanLabel = pimClass.pimHumanLabel;
    classData.humanDescription = pimClass.pimHumanDescription;
    classData.extends = pimClass.pimIsa
      .map(iri => this.entities[iri])
      .map(entity => this.loadClassFromPimClass(entity));
    classData.properties = [];
  }

  loadClassFromCimIri(iri: string): ClassData {
    const entity = this.entities[iri];
    if (!CimEntity.is(entity)) {
      throw new Error(
        ` ${entity.id} with types [${entity.rdfTypes}] is not cim:Entity.`);
    }
    const result = new ClassData();
    this.cimEntityToClass(entity as CimEntity, result);
    return result;
  }

  protected cimEntityToClass(cimEntity: CimEntity, classData: ClassData) {
    classData.cimIri = cimEntity.id;
    classData.humanLabel = cimEntity.cimHumanLabel;
    classData.humanDescription = cimEntity.cimHumanDescription;
  }

}

