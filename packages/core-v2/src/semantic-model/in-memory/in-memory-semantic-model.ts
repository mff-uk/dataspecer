import { InMemoryEntityModel } from "../../entity-model/in-memory-entity-model";
import { LOCAL_SEMANTIC_MODEL } from "../../model/known-models";
import { WritableSemanticModelAdapter } from "../writable-semantic-model-adapter";

export class InMemorySemanticModel extends WritableSemanticModelAdapter {
    private baseIri: string = "";

    constructor() {
        super(new InMemoryEntityModel());
    }

    getBaseIri() {
        return this.baseIri;
    }

    setBaseIri(iri: string) {
        this.baseIri = iri;
    }

    serializeModel() {
        return {
            // TODO: fix
            type: LOCAL_SEMANTIC_MODEL,
            modelId: this.getId(),
            modelAlias: this.getAlias(),
            baseIri: this.baseIri ?? "",
            entities: this.entityModel.entities,
        };
    }

    deserializeModel(data: object) {
        const modelDescriptor = data as any;
        this.baseIri = modelDescriptor.baseIri;
        this.entityModel.id = modelDescriptor.modelId;
        this.entityModel.alias = modelDescriptor.modelAlias;
        this.entityModel.entities = modelDescriptor.entities;

        return this;
    }
}
