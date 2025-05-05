import { CoreResource } from "@dataspecer/core/core/core-resource";
import { EntityModel } from './entity-model.ts';
import { CoreResourceReader } from "@dataspecer/core/core/core-reader";

export class EntityModelAsCoreResourceReader implements CoreResourceReader {
  private readonly entityModel: EntityModel;
  private readonly id: string;

  constructor(entityModel: EntityModel) {
    this.entityModel = entityModel;
    this.id = entityModel.getId();
  }

  async listResources(): Promise<string[]> {
    return [this.id, ...Object.keys(this.entityModel.getEntities())];
  }

  listResourcesOfType(typeIri: string): Promise<string[]> {
    throw new Error('Method not implemented.');
  }

  async readResource(iri: string): Promise<CoreResource | null> {
    if (iri === this.id) {
      return this.entityModel as unknown as CoreResource;
    }
    return this.entityModel.getEntities()[iri] as unknown as CoreResource ?? null;
  }
}