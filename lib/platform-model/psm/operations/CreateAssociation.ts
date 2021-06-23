import {Operation} from "../../platform-model-operations";
import {Store} from "../../platform-model-store";
import {ModelResource} from "../../platform-model-api";
import {PsmAssociation} from "../psm-association";

interface CreateAssociationParameters {
    /** Association id */
    id: string;

    /** Second association end as PSM id */
    toId: string;
}

export class CreateAssociation implements Operation<CreateAssociationParameters> {
  canExecute(store: Store, parameters: CreateAssociationParameters): boolean {
    return true; // todo implement
  }

  execute(store: Store, parameters: CreateAssociationParameters): Store {
    const {id, toId} = parameters;
    let resource = store[id];
    resource = resource ? {...resource} : new ModelResource(id);
    const association = PsmAssociation.as(resource);
    association.psmParts = [toId];
    return {...store, [id]: association};
  }
}