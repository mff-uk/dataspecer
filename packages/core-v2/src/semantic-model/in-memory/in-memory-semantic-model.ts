import { InMemoryEntityModel } from "../../entity-model/in-memory-entity-model";
import { LOCAL_SEMANTIC_MODEL } from "../../model/known-models";
import { WritableSemanticModelAdapter } from "../writable-semantic-model-adapter";

export class InMemorySemanticModel extends WritableSemanticModelAdapter {
    constructor() {
        super(new InMemoryEntityModel());
    }

    serializeModel() {
        return {
            // TODO: fix
            type: LOCAL_SEMANTIC_MODEL,
            modelId: this.getId(),
            modelAlias: this.getAlias(),
            entities: this.entityModel.entities,
        };
    }

    deserializeModel(data: object) {
        const modelDescriptor = data as any;
        this.entityModel.id = modelDescriptor.modelId;
        this.entityModel.alias = modelDescriptor.modelAlias;
        this.entityModel.entities = modelDescriptor.entities;

        return this;
    }
}
