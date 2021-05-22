import {ModelResource} from "../../platform-model-api";
import {PsmSchema} from "../psm-schema";
import {PsmBase} from "../psm-base";
import {PsmClass} from "../psm-class";
import {PsmAttribute} from "../psm-attribute";
import {Operation} from "../../platform-model-operations";
import {Store} from "../../platform-model-store";

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

/**
 * Updates an interpretation of PsmBase element. Performs no checks.
 */
function updatePsmInterpretation(store: Store, parameters: {id: string, interpretation: string}): Store {
    const {id, interpretation} = parameters;
    let cls = <PsmBase>{...store[id]};
    cls.psmInterpretation = interpretation;
    return {...store, [id]: cls};
}

interface UpdateClassInterpretationParameters {
    /** PSM class id */
    id: string;

    /** New PIM class to be interpreted */
    interpretation: string;
}

export class UpdateClassInterpretation implements Operation<UpdateClassInterpretationParameters> {
    canExecute(store: Store, parameters: UpdateClassInterpretationParameters): boolean {
        return true; // todo implement
    }

    execute(store: Store, parameters: UpdateClassInterpretationParameters): Store {
        return updatePsmInterpretation(store, parameters);
    }

}

interface UpdateAttributeInterpretationParameters {
    /** PSM attribute id */
    id: string;

    /** New PIM attribute to be interpreted */
    interpretation: string;
}

export class UpdateAttributeInterpretation implements Operation<UpdateAttributeInterpretationParameters> {
    canExecute(store: Store, parameters: UpdateAttributeInterpretationParameters): boolean {
        return true; // todo fix
    }

    execute(store: Store, parameters: UpdateAttributeInterpretationParameters): Store {
        return updatePsmInterpretation(store, parameters);
    }
}
