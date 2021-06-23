import {Operation} from "../../platform-model-operations";
import {Store} from "../../platform-model-store";
import {ModelResource} from "../../platform-model-api";
import {PsmSchema} from "../psm-schema";

interface CreateSchemaParameters {
    id: string;
}

export class CreateSchema implements Operation<CreateSchemaParameters> {
  canExecute(): boolean {
    return true;
  }

  execute(store: Store, parameters: CreateSchemaParameters): Store {
    const {id} = parameters;
    let schema = store[id];
    schema = schema ? {...schema} : new ModelResource(id);
    PsmSchema.as(schema);
    return {...store, [id]: schema};
  }
}