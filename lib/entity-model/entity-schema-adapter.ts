import {ModelResource} from "../platform-model/platform-model-api";
import {SchemaData} from "./entity-model";
import {PsmSchema} from "../platform-model/psm/psm-schema";
import {EntityClassAdapter} from "./entity-class-adapter";

export class EntitySchemaAdapter {

  readonly entities: Record<string, ModelResource>;

  readonly psmSchema: Record<string, SchemaData> = {};

  readonly classAdapter: EntityClassAdapter;

  constructor(entities: Record<string, ModelResource>) {
    this.entities = entities;
    this.classAdapter = new EntityClassAdapter(entities, this);
  }

  loadPsmSchemaFromIri(iri: string): SchemaData | undefined {
    const entity = this.entities[iri];
    return this.loadPsmSchemaFromEntity(entity);
  }

  loadPsmSchemaFromEntity(entity: ModelResource): SchemaData {
    if (this.psmSchema[entity.id] !== undefined) {
      return this.psmSchema[entity.id];
    }
    if (!PsmSchema.is(entity)) {
      throw new Error(
        ` ${entity.id} with types [${entity.rdfTypes}] is not psm:Schema.`);
    }
    const result = new SchemaData();
    this.psmSchema[entity.id] = result;
    this.psmSchemaToSchema(entity as PsmSchema, result);
    return result;
  }

  psmSchemaToSchema(psmSchema: PsmSchema, schemaData: SchemaData) {
    schemaData.psmIri = psmSchema.id;
    schemaData.humanLabel = psmSchema.psmHumanLabel;
    schemaData.humanDescription = psmSchema.psmHumanDescription;
    schemaData.roots = psmSchema.psmRoots
      .map(iri => this.entities[iri])
      .map(entity => this.classAdapter.loadClassFromPsmClass(entity));
  }

}


