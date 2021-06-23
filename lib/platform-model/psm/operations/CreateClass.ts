import {Operation} from "../../platform-model-operations";
import {Store} from "../../platform-model-store";
import {ModelResource} from "../../platform-model-api";
import {PsmClass} from "../psm-class";

interface CreateClassParameters {
    id: string;
}

export class CreateClass implements Operation<CreateClassParameters> {
  canExecute(): boolean {
    return true;
  }

  execute(store: Store, parameters: CreateClassParameters): Store {
    const {id} = parameters;
    let cls = store[id];
    cls = cls ? {...cls} : new ModelResource(id);
    PsmClass.as(cls);
    return {...store, [id]: cls};
  }
}