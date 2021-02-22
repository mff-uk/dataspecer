import {RdfEntity} from "../rdf/rdf-api";
import {StatementSource} from "../rdf/statements/statements-api";
import {EntitySource} from "../rdf/entity-source";
import {ModelResource, ModelLoader} from "./platform-model-api";
import {CimEntityAdapter} from "./cim/cim-entity";
import {PimAssociationAdapter} from "./pim/pim-association";
import {PimAttributeAdapter} from "./pim/pim-attribute";
import {PimClassAdapter} from "./pim/pim-class";
import {PimSchemaAdapter} from "./pim/pim-schema";
import {PsmAssociationAdapter} from "./psm/psm-association";
import {PsmAttributeAdapter} from "./psm/psm-attribute";
import {PsmClassAdapter} from "./psm/psm-class";
import {PsmChoiceAdapter} from "./psm/psm-choice";
import {PsmIncludesAdapter} from "./psm/psm-includes";
import {PsmSchemaAdapter} from "./psm/psm-schema";

type ResourceMap = Record<string, ModelResource>;

export class PlatformModelAdapter {

  readonly source: StatementSource;

  psmAdapters: ModelLoader[] = [];

  pimAdapters: ModelLoader[] = [];

  cimAdapters: ModelLoader[] = [];

  resources: ResourceMap = {};

  entitiesToLoad: RdfEntity[] = [];

  protected constructor(source: StatementSource) {
    this.source = source;
  }

  static create(source: StatementSource) : PlatformModelAdapter {
    const result = new PlatformModelAdapter(source);
    result.psmAdapters = [
      new PsmAssociationAdapter(),
      new PsmAttributeAdapter(),
      new PsmClassAdapter(),
      new PsmChoiceAdapter(),
      new PsmIncludesAdapter(),
      new PsmSchemaAdapter(),
    ];
    result.pimAdapters = [
      new PimAssociationAdapter(),
      new PimAttributeAdapter(),
      new PimClassAdapter(),
      new PimSchemaAdapter(),
    ];
    result.cimAdapters = [
      new CimEntityAdapter(),
    ];
    return result;
  }

  get(): ResourceMap {
    return this.resources;
  }

  clear() {
    this.resources = {};
  }

  async loadIriTree(iri: string) {
    await this.loadEntityTree(RdfEntity.create(iri));
  }

  async loadEntityTree(entity: RdfEntity) {
    this.entitiesToLoad = [entity];
    while (this.entitiesToLoad.length > 0) {
      const next: RdfEntity = this.entitiesToLoad.pop();
      if (this.shouldLoad(next)) {
        await this.loadEntity(next);
      }
    }
  }

  shouldLoad(entity:RdfEntity):boolean {
    return this.resources[entity.id] === undefined;
  }

  async loadEntity(entity: RdfEntity) {
    const entitySource = EntitySource.forEntity(entity, this.source);
    const types = await entitySource.types();
    const resource = new ModelResource(entitySource.id(), types);
    this.resources[resource.id] = resource;
    await this.loadEntityWithAdapters(
      resource, entitySource, this.psmAdapters);
    await this.loadEntityWithAdapters(
      resource, entitySource, this.pimAdapters);
    // We have no way how to detect CIM level, so we just use it
    // as a fallback option.
    // TODO Improve handling and detect unknown entities.
    if (resource.types.length === 0) {
      await this.loadEntityWithAdapters(
        resource, entitySource, this.cimAdapters);
    }
  }

  async loadEntityWithAdapters(
    resource: ModelResource, entitySource: EntitySource, adapters:ModelLoader[]
  ) {
    for (const loader of adapters) {
      if (loader.canLoadResource(resource)) {
        (await loader.loadIntoResource(entitySource, resource))
          .filter(iri => iri !== undefined)
          .forEach(iri => this.entitiesToLoad.push(RdfEntity.create(iri)))
      }
    }
  }

}
