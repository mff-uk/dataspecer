import { SemanticModelAdapter } from "./semantic-model-adapter";
import { Entity, InMemoryEntityModel } from "../entity-model";
import {
    CreatedEntityOperationResult,
    isCreateClassOperation,
    isCreateGeneralizationOperation,
    isCreateRelationshipOperation,
    isDeleteEntityOperation,
    isModifyClassOperation,
    isModifyGeneralizationOperation,
    isModifyRelationOperation,
    Operation,
} from "./operations";
import { SemanticModelClass, SemanticModelGeneralization, SemanticModelRelationship } from "./concepts";
import {
    isCreateClassUsageOperation,
    isCreateRelationshipUsageOperation,
    isModifyClassUsageOperation,
    isModifyRelationshipUsageOperation,
} from "./usage/operations";
import { SemanticModelClassUsage, SemanticModelRelationshipUsage } from "./usage/concepts";

function uuid() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Semantic model, that is writable.
 */
export class WritableSemanticModelAdapter extends SemanticModelAdapter {
    protected declare readonly entityModel: InMemoryEntityModel;

    constructor(entityModel: InMemoryEntityModel) {
        super(entityModel);
    }

    public executeOperation(operation: Operation) {
        // todo this is just a mock implementation

        if (isCreateClassOperation(operation)) {
            let id = operation.entity.id;

            // Generate random id if not provided
            if (id === undefined) {
                id = uuid();
            }

            if (this.entityModel.entities[id]) {
                return {
                    success: false,
                };
            }

            const cls: SemanticModelClass = {
                id,
                iri: operation.entity.iri ?? null,
                type: ["class"],
                name: operation.entity.name ?? {},
                description: operation.entity.description ?? {},
            };

            this.entityModel.change({ [id]: cls }, []);
            return {
                success: true,
                id,
            } satisfies CreatedEntityOperationResult;
        }

        if (isModifyClassOperation(operation)) {
            if (!this.entityModel.entities[operation.id]) {
                return {
                    success: false,
                };
            }
            this.entityModel.change(
                { [operation.id]: { ...this.entityModel.entities[operation.id]!, ...operation.entity } },
                []
            );
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

            if (this.entityModel.entities[id]) {
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
                        cardinality: operation.entity.ends?.[0]?.cardinality, // ?? [0, null],
                        concept: operation.entity.ends?.[0]?.concept ?? null,
                        iri: operation.entity.ends?.[0]?.iri ?? null,
                    },
                    {
                        name: operation.entity.ends?.[1]?.name ?? {},
                        description: operation.entity.ends?.[1]?.description ?? {},
                        cardinality: operation.entity.ends?.[1]?.cardinality, // ?? [0, null],
                        concept: operation.entity.ends?.[1]?.concept ?? null,
                        iri: operation.entity.ends?.[1]?.iri ?? null,
                    },
                ],
            };

            this.entityModel.change({ [id]: relationship }, []);
            return {
                success: true,
                id,
            } satisfies CreatedEntityOperationResult;
        }

        if (isModifyRelationOperation(operation)) {
            const oldRelationship = this.entityModel.entities[operation.id] as SemanticModelRelationship | undefined;

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
                        ...operation.entity.ends?.[1],
                    },
                ],
                name: operation.entity.name ?? oldRelationship.name,
                description: operation.entity.description ?? oldRelationship.description,
                iri: operation.entity.iri ?? oldRelationship.iri,
            } as SemanticModelRelationship;

            this.entityModel.change({ [operation.id]: updatedRelationship }, []);
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

            if (this.entityModel.entities[id]) {
                return {
                    success: false,
                };
            }

            const generalization: SemanticModelGeneralization = {
                id,
                iri: operation.entity.iri ?? null,
                child: operation.entity.child ?? "",
                parent: operation.entity.parent ?? "",
                type: ["generalization"],
            };

            this.entityModel.change({ [id]: generalization }, []);
            return {
                success: true,
                id,
            } satisfies CreatedEntityOperationResult;
        }

        if (isModifyGeneralizationOperation(operation)) {
            if (!this.entityModel.entities[operation.id]) {
                return {
                    success: false,
                };
            }
            this.entityModel.change(
                { [operation.id]: { ...this.entityModel.entities[operation.id]!, ...operation.entity } },
                []
            );
            return {
                success: true,
            };
        }

        if (isDeleteEntityOperation(operation)) {
            if (!this.entityModel.entities[operation.id]) {
                return {
                    success: false,
                };
            }
            this.entityModel.change({}, [operation.id]);
            return {
                success: true,
            };
        }

        if (isCreateClassUsageOperation(operation)) {
            let id = operation.entity.id;

            // Generate random id if not provided
            if (id === undefined) {
                id = uuid();
            }

            if (this.entityModel.entities[id]) {
                return {
                    success: false,
                };
            }

            const cls: SemanticModelClassUsage = {
                id,
                usageOf: operation.entity.usageOf,
                type: ["class-usage"],
                iri: operation.entity.iri ?? null,
                name: operation.entity.name ?? null,
                description: operation.entity.description ?? null,
                usageNote: operation.entity.usageNote ?? null,
            };

            this.entityModel.change({ [id]: cls }, []);
            return {
                success: true,
                id,
            } satisfies CreatedEntityOperationResult;
        }

        if (isModifyClassUsageOperation(operation)) {
            if (!this.entityModel.entities[operation.id]) {
                return {
                    success: false,
                };
            }
            this.entityModel.change(
                { [operation.id]: { ...this.entityModel.entities[operation.id]!, ...operation.entity } },
                []
            );
            return {
                success: true,
            };
        }

        if (isCreateRelationshipUsageOperation(operation)) {
            let id = operation.entity.id;

            // Generate random id if not provided
            if (id === undefined) {
                id = uuid();
            }

            if (this.entityModel.entities[id]) {
                return {
                    success: false,
                };
            }

            const relationship: SemanticModelRelationshipUsage = {
                usageNote: operation.entity.usageNote ?? null,
                id,
                type: ["relationship-usage"],
                iri: operation.entity.iri ?? null,
                usageOf: operation.entity.usageOf,
                name: operation.entity.name ?? null,
                description: operation.entity.description ?? null,
                ends: [
                    {
                        name: operation.entity.ends?.[0]?.name ?? null,
                        description: operation.entity.ends?.[0]?.description ?? null,
                        cardinality: operation.entity.ends?.[0]?.cardinality ?? null,
                        concept: operation.entity.ends?.[0]?.concept ?? null,
                        usageNote: operation.entity.ends?.[0]?.usageNote ?? null,
                        iri: operation.entity.ends?.[0]?.iri ?? null,
                    },
                    {
                        name: operation.entity.ends?.[1]?.name ?? null,
                        description: operation.entity.ends?.[1]?.description ?? null,
                        cardinality: operation.entity.ends?.[1]?.cardinality ?? null,
                        concept: operation.entity.ends?.[1]?.concept ?? null,
                        usageNote: operation.entity.ends?.[1]?.usageNote ?? null,
                        iri: operation.entity.ends?.[1]?.iri ?? null,
                    },
                ],
            };

            this.entityModel.change({ [id]: relationship }, []);
            return {
                success: true,
                id,
            } satisfies CreatedEntityOperationResult;
        }

        if (isModifyRelationshipUsageOperation(operation)) {
            const oldRelationship = this.entityModel.entities[operation.id] as
                | SemanticModelRelationshipUsage
                | undefined;

            if (!oldRelationship) {
                return {
                    success: false,
                };
            }

            const updatedRelationship = {
                ...oldRelationship,
                usageNote: operation.entity.usageNote ?? oldRelationship.usageNote,
                name: operation.entity.name ?? oldRelationship.name,
                description: operation.entity.description ?? oldRelationship.description,
                ends: [
                    {
                        ...oldRelationship.ends[0],
                        ...operation.entity.ends?.[0],
                    },
                    {
                        ...oldRelationship.ends[1],
                        ...operation.entity.ends?.[1],
                    },
                ],
            } as SemanticModelRelationshipUsage;

            this.entityModel.change({ [operation.id]: updatedRelationship }, []);
            return {
                success: true,
            };
        }

        return {
            success: false,
        };
    }

    public executeOperations(operations: Operation[]) {
        let updated: Record<string, Entity> = {};
        const deleted = [];
        for (const operation of operations) {
            // todo this is just a mock implementation

            if (isCreateClassOperation(operation)) {
                let id = operation.entity.id;

                // Generate random id if not provided
                if (id === undefined) {
                    id = uuid();
                }

                if (this.entityModel.entities[id]) {
                    continue;
                }

                const cls: SemanticModelClass = {
                    id,
                    iri: operation.entity.iri ?? null,
                    type: ["class"],
                    name: operation.entity.name ?? {},
                    description: operation.entity.description ?? {},
                };

                updated = { ...updated, [id]: cls };
                continue;
            } else if (isModifyClassOperation(operation)) {
                if (!this.entityModel.entities[operation.id]) {
                    continue;
                }
                updated = {
                    ...updated,
                    [operation.id]: { ...this.entityModel.entities[operation.id]!, ...operation.entity },
                };
                continue;
            } else if (isCreateRelationshipOperation(operation)) {
                let id = operation.entity.id;

                // Generate random id if not provided
                if (id === undefined) {
                    id = uuid();
                }

                if (this.entityModel.entities[id]) {
                    continue;
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
                            cardinality: operation.entity.ends?.[0]?.cardinality, // ?? [0, null],
                            concept: operation.entity.ends?.[0]?.concept ?? null,
                            iri: operation.entity.ends?.[0]?.iri ?? null,
                        },
                        {
                            name: operation.entity.ends?.[1]?.name ?? {},
                            description: operation.entity.ends?.[1]?.description ?? {},
                            cardinality: operation.entity.ends?.[1]?.cardinality, // ?? [0, null],
                            concept: operation.entity.ends?.[1]?.concept ?? null,
                            iri: operation.entity.ends?.[1]?.iri ?? null,
                        },
                    ],
                };

                updated = { ...updated, [id]: relationship };
                continue;
            } else if (isModifyRelationOperation(operation)) {
                const oldRelationship = this.entityModel.entities[operation.id] as
                    | SemanticModelRelationship
                    | undefined;

                if (!oldRelationship) {
                    continue;
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
                            ...operation.entity.ends?.[1],
                        },
                    ],
                    name: operation.entity.name ?? oldRelationship.name,
                    description: operation.entity.description ?? oldRelationship.description,
                    iri: operation.entity.iri ?? oldRelationship.iri,
                } as SemanticModelRelationship;

                updated = { ...updated, [operation.id]: updatedRelationship };
                continue;
            } else if (isCreateGeneralizationOperation(operation)) {
                let id = operation.entity.id;

                // Generate random id if not provided
                if (id === undefined) {
                    id = uuid();
                }

                if (this.entityModel.entities[id]) {
                    continue;
                }

                const generalization: SemanticModelGeneralization = {
                    id,
                    iri: operation.entity.iri ?? null,
                    child: operation.entity.child ?? "",
                    parent: operation.entity.parent ?? "",
                    type: ["generalization"],
                };

                updated = { ...updated, [id]: generalization };
                continue;
            } else if (isModifyGeneralizationOperation(operation)) {
                if (!this.entityModel.entities[operation.id]) {
                    continue;
                }
                updated = {
                    ...updated,
                    [operation.id]: { ...this.entityModel.entities[operation.id]!, ...operation.entity },
                };
                continue;
            } else if (isDeleteEntityOperation(operation)) {
                if (!this.entityModel.entities[operation.id]) {
                    continue;
                }
                deleted.push(operation.id);
                continue;
            } else if (isCreateClassUsageOperation(operation)) {
                let id = operation.entity.id;

                // Generate random id if not provided
                if (id === undefined) {
                    id = uuid();
                }

                if (this.entityModel.entities[id]) {
                    continue;
                }

                const cls: SemanticModelClassUsage = {
                    id,
                    usageOf: operation.entity.usageOf,
                    type: ["class-usage"],
                    iri: operation.entity.iri ?? null,
                    name: operation.entity.name ?? null,
                    description: operation.entity.description ?? null,
                    usageNote: operation.entity.usageNote ?? null,
                };

                updated = { ...updated, [id]: cls };
                continue;
            } else if (isModifyClassUsageOperation(operation)) {
                if (!this.entityModel.entities[operation.id]) {
                    continue;
                }
                updated = {
                    ...updated,
                    [operation.id]: { ...this.entityModel.entities[operation.id]!, ...operation.entity },
                };
                continue;
            } else if (isCreateRelationshipUsageOperation(operation)) {
                let id = operation.entity.id;

                // Generate random id if not provided
                if (id === undefined) {
                    id = uuid();
                }

                if (this.entityModel.entities[id]) {
                    continue;
                }

                const relationship: SemanticModelRelationshipUsage = {
                    usageNote: operation.entity.usageNote ?? null,
                    id,
                    type: ["relationship-usage"],
                    iri: operation.entity.iri ?? null,
                    usageOf: operation.entity.usageOf,
                    name: operation.entity.name ?? null,
                    description: operation.entity.description ?? null,
                    ends: [
                        {
                            name: operation.entity.ends?.[0]?.name ?? null,
                            description: operation.entity.ends?.[0]?.description ?? null,
                            cardinality: operation.entity.ends?.[0]?.cardinality ?? null,
                            concept: operation.entity.ends?.[0]?.concept ?? null,
                            usageNote: operation.entity.ends?.[0]?.usageNote ?? null,
                            iri: operation.entity.ends?.[0]?.iri ?? null,
                        },
                        {
                            name: operation.entity.ends?.[1]?.name ?? null,
                            description: operation.entity.ends?.[1]?.description ?? null,
                            cardinality: operation.entity.ends?.[1]?.cardinality ?? null,
                            concept: operation.entity.ends?.[1]?.concept ?? null,
                            usageNote: operation.entity.ends?.[1]?.usageNote ?? null,
                            iri: operation.entity.ends?.[0]?.iri ?? null,
                        },
                    ],
                };

                updated = { ...updated, [id]: relationship };
                continue;
            } else if (isModifyRelationshipUsageOperation(operation)) {
                const oldRelationship = this.entityModel.entities[operation.id] as
                    | SemanticModelRelationshipUsage
                    | undefined;

                if (!oldRelationship) {
                    continue;
                }

                const updatedRelationship = {
                    ...oldRelationship,
                    usageNote: operation.entity.usageNote ?? oldRelationship.usageNote,
                    name: operation.entity.name ?? oldRelationship.name,
                    description: operation.entity.description ?? oldRelationship.description,
                    ends: [
                        {
                            ...oldRelationship.ends[0],
                            ...operation.entity.ends?.[0],
                        },
                        {
                            ...oldRelationship.ends[1],
                            ...operation.entity.ends?.[1],
                        },
                    ],
                } as SemanticModelRelationshipUsage;

                updated = { ...updated, [operation.id]: updatedRelationship };
                continue;
            }
        }
        this.entityModel.change(updated, deleted);
    }
}
