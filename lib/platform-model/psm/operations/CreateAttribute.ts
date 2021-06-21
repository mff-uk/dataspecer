import {Operation} from "../../platform-model-operations";
import {Store} from "../../platform-model-store";
import {PsmClass} from "../psm-class";
import {ModelResource} from "../../platform-model-api";
import {PsmAttribute} from "../psm-attribute";

interface CreateAttributeParameters {
    /** Attribute id */
    id: string;

    /** Owner class id */
    classId: string;
}

export class CreateAttribute implements Operation<CreateAttributeParameters> {
    canExecute(store: Store, parameters: CreateAttributeParameters): boolean {
        const {classId} = parameters;
        return PsmClass.is(store[classId]);
    }

    execute(store: Store, parameters: CreateAttributeParameters): Store {
        const {id, classId} = parameters;
        let resource = store[id];
        resource = resource ? {...resource} : new ModelResource(id);
        const attribute = PsmAttribute.as(resource);
        //attribute.pimHasClass = classId; todo fix
        return {...store, [id]: attribute};
    }
}