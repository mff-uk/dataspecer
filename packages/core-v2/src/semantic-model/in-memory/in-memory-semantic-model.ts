import {InMemoryEntityModel} from "../../entity-model/in-memory-entity-model";
import {WritableSemanticModelAdapter} from "../writable-semantic-model-adapter";

export class InMemorySemanticModel extends WritableSemanticModelAdapter {
    constructor() {
        super(new InMemoryEntityModel());
    }
}