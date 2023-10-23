import {InMemoryEntityModel} from "../../entity-model/implementation";
import {
    isCreateClassOperation, isCreateGeneralizationOperation,
    isCreateRelationshipOperation,
    isDeleteEntityOperation,
    isModifyClassOperation, isModifyGeneralizationOperation,
    isModifyRelationOperation,
    Operation,
    OperationResult
} from "../operations/operations";
import {SemanticModelClass, SemanticModelGeneralization, SemanticModelRelationship} from "../concepts/concepts";

function uuid() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export class InMemorySemanticModel extends InMemoryEntityModel {
    public executeOperation(operation: Operation): OperationResult {
        // todo this is just a mock implementation

        if (isCreateClassOperation(operation)) {
            let id = operation.entity.id;

            // Generate random id if not provided
            if (id === undefined) {
                id = uuid();
            }

            if (this.entities[id]) {
                return {
                    success: false,
                };
            }

            const cls: SemanticModelClass = {
                id,
                iri: operation.entity.iri ?? null,
                type: ["class"],
                name: operation.entity.name ?? {},
                description: operation.entity.description ?? {}
            };

            this.change({[id]: cls}, []);
            return {
                success: true,
            };
        }

        if (isModifyClassOperation(operation)) {
            if (!this.entities[operation.id]) {
                return {
                    success: false,
                };
            }
            this.change({[operation.id]: {...this.entities[operation.id], ...operation.entity}}, []);
            return {
                success: true,
            };
        }

        if (isCreateRelationshipOperation(operation)) {
            let id = operation.entity.id;

            // Generate random id if not provided
            if (id === undefined) {
                id = uuid();
            }

            if (this.entities[id]) {
                return {
                    success: false,
                };
            }

            const relationship: SemanticModelRelationship = {
                id,
                type: ["relationship"],
                iri: operation.entity.iri ?? null,
                name: operation.entity.name ?? {},
                description: operation.entity.description ?? {},
                ends: [
                    {
                        name: operation.entity.ends?.[0]?.name ?? {},
                        description: operation.entity.ends?.[0]?.description ?? {},
                        cardinality: operation.entity.ends?.[0]?.cardinality ?? [0, null],
                        concept: operation.entity.ends?.[0]?.concept ?? "",
                    },
                    {
                        name: operation.entity.ends?.[1]?.name ?? {},
                        description: operation.entity.ends?.[1]?.description ?? {},
                        cardinality: operation.entity.ends?.[1]?.cardinality ?? [0, null],
                        concept: operation.entity.ends?.[1]?.concept ?? "",
                    }
                ]
            };

            this.change({[id]: relationship}, []);
            return {
                success: true,
            };
        }

        if (isModifyRelationOperation(operation)) {
            const oldRelationship = this.entities[operation.id] as SemanticModelRelationship | undefined

            if (!oldRelationship) {
                return {
                    success: false,
                };
            }

            const updatedRelationship = {
                ...oldRelationship,
                ends: [
                    {
                        ...oldRelationship.ends[0],
                        ...operation.entity.ends?.[0],
                    },
                    {
                        ...oldRelationship.ends[1],
                        ...operation.entity.ends?.[0],
                    }
                ]
            } as SemanticModelRelationship;

            this.change({[operation.id]: updatedRelationship}, []);
            return {
                success: true,
            };
        }

        if (isCreateGeneralizationOperation(operation)) {
            let id = operation.entity.id;

            // Generate random id if not provided
            if (id === undefined) {
                id = uuid();
            }

            if (this.entities[id]) {
                return {
                    success: false,
                };
            }

            const generalization: SemanticModelGeneralization = {
                id,
                iri: operation.entity.iri ?? null,
                child: operation.entity.child ?? "",
                parent: operation.entity.parent ?? "",
                type: ["generalization"]
            };

            this.change({[id]: generalization}, []);
            return {
                success: true,
            };
        }

        if (isModifyGeneralizationOperation(operation)) {
            if (!this.entities[operation.id]) {
                return {
                    success: false,
                };
            }
            this.change({[operation.id]: {...this.entities[operation.id], ...operation.entity}}, []);
            return {
                success: true,
            };
        }

        if (isDeleteEntityOperation(operation)) {
            if (!this.entities[operation.id]) {
                return {
                    success: false,
                };
            }
            this.change({}, [operation.id]);
            return {
                success: true,
            };
        }

        return {
            success: false,
        };
    }
}