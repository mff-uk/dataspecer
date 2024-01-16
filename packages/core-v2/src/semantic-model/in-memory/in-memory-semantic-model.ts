import { InMemoryEntityModel } from "../../entity-model/in-memory-entity-model";
import { WritableSemanticModelAdapter } from "../writable-semantic-model-adapter";

export class InMemorySemanticModel extends WritableSemanticModelAdapter {
    constructor() {
        super(new InMemoryEntityModel());
    }

    serializeModel() {
        return {
            // TODO: fix
            type: "https://dataspecer.com/core/model-descriptor/in-memory-semantic-model",
            modelId: this.getId(),
            entities: this.entityModel.entities,
        };
    }

    deserializeModel(data: object) {
        const modelDescriptor = data as any;
        this.entityModel.id = modelDescriptor.modelId;
        this.entityModel.entities = modelDescriptor.entities;

        return this;
    }
}
