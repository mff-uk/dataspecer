import ReactFlow, {
    Background,
    Connection,
    Controls,
    Edge,
    EdgeChange,
    MiniMap,
    Node,
    NodeChange,
    useEdgesState,
    useNodesState,
} from "reactflow";
import { useMemo, useCallback, useEffect } from "react";
import { ClassCustomNode, semanticModelClassToReactFlowNode } from "./reactflow/class-custom-node";
import {
    SimpleFloatingEdge,
    semanticModelGeneralizationToReactFlowEdge,
    semanticModelRelationshipToReactFlowEdge,
} from "./reactflow/simple-floating-edge";
import { isAttribute, tailwindColorToHex } from "./util/utils";

import "reactflow/dist/style.css";
import { useCreateConnectionDialog } from "./dialogs/create-connection-dialog";
import { useModelGraphContext } from "./context/graph-context";
import {
    SemanticModelClass,
    SemanticModelGeneralization,
    SemanticModelRelationship,
    isSemanticModelClass,
    isSemanticModelGeneralization,
    isSemanticModelRelationship,
} from "@dataspecer/core-v2/semantic-model/concepts";
import { Entity } from "@dataspecer/core-v2/entity-model";
import { useClassesContext } from "./context/classes-context";
import { VisualEntity } from "@dataspecer/core-v2/visual-model";

export interface AggregatedEntityWrapper {
    id: string;
    aggregatedEntity: Entity | null;
    visualEntity: VisualEntity | null;
}

export const Visualization = () => {
    const { aggregatorView, models } = useModelGraphContext();
    const { CreateConnectionDialog, isCreateConnectionDialogOpen, openCreateConnectionDialog } =
        useCreateConnectionDialog();
    const { classes, relationships, attributes, generalizations } = useClassesContext();

    const activeVisualModel = useMemo(() => aggregatorView.getActiveVisualModel(), [aggregatorView]);

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const nodeTypes = useMemo(() => ({ classCustomNode: ClassCustomNode }), []);
    const edgeTypes = useMemo(() => ({ floating: SimpleFloatingEdge }), []);

    const onConnect = useCallback(
        (connection: Connection) => {
            openCreateConnectionDialog(connection);
        },
        [setEdges]
    );

    const relationshipOrGeneralizationToEdgeType = (
        entity: Entity | null,
        color: string | undefined
    ): Edge | undefined => {
        if (isSemanticModelRelationship(entity)) {
            return semanticModelRelationshipToReactFlowEdge(entity as SemanticModelRelationship, color) as Edge;
        } else if (isSemanticModelGeneralization(entity)) {
            return semanticModelGeneralizationToReactFlowEdge(
                entity as SemanticModelGeneralization,
                color,
                undefined
            ) as Edge;
        }
        return;
    };

    useEffect(() => {
        const aggregatorCallback = (updated: AggregatedEntityWrapper[], removed: string[]) => {
            const entities = aggregatorView.getEntities();
            console.log("visualization: callback2", updated, removed, entities);
            const [localClasses, localRelationships, localAttributes, localGeneralizations, localModels] = [
                classes,
                relationships,
                attributes,
                generalizations,
                models,
            ];

            const getNode = (cls: SemanticModelClass, visualEntity: VisualEntity | null) => {
                const pos = visualEntity?.position;
                const visible = visualEntity?.visible;
                console.log("callback2: getNode", cls, visualEntity, pos, visible);
                if (!cls || !pos) {
                    return;
                }
                if (!visible) {
                    return "hide-it!";
                }
                const origin = localClasses.get(cls.id)?.origin;
                if (!origin) {
                    console.log("!origin", localClasses.get(cls.id), cls.id, localClasses);
                }
                return semanticModelClassToReactFlowNode(
                    cls.id,
                    cls,
                    pos,
                    origin ? activeVisualModel?.getColor(origin) : "#ffaa66", // colorForModel.get(UNKNOWN_MODEL_ID),
                    localAttributes.filter((attr) => attr.ends[0]?.concept == cls.id).map((attr) => attr.ends[1]!)
                );
            };

            const getEdge = (
                relOrGen: SemanticModelRelationship | SemanticModelGeneralization,
                color: string | undefined
            ) => {
                return relationshipOrGeneralizationToEdgeType(relOrGen, color);
            };

            for (const r in removed) {
                // const { aggregatedEntity: entity, visualEntity } = entities[r] ?? {
                //     aggregatedEntity: null,
                //     visualEntity: null,
                // };
                // if (isSemanticModelClass(entity)) {
                //     const n = getNode(entity, visualEntity);
                //     console.log("callback2: is entity", entity, n);
                //     if (n) {
                //         setNodes((prev) => prev.filter((n) => n.data.cls.id !== id).concat(n));
                //     }
                // } else if (isSemanticModelRelationship(entity) || isSemanticModelGeneralization(entity)) {
                //     if (isSemanticModelRelationship(entity) && isAttribute(entity)) {
                //         // it is an attribute, rerender the node that the attribute comes form
                //         const aggrEntity = entities[entity.ends[0]?.concept ?? ""]?.aggregatedEntity ?? null;
                //         if (isSemanticModelClass(aggrEntity)) {
                //             // TODO: omg, localAttributes jeste v sobe nemaj ten novej atribut, tak ho se musim jeste pridat 🤦
                //             localAttributes.push(entity);
                //             const visEntity = entities[aggrEntity.id]?.visualEntity;
                //             const n = getNode(aggrEntity, visEntity ?? null);
                //             console.log("visualization: is attribute: after get node", n, localAttributes);
                //             if (n) {
                //                 setNodes((prev) => prev.filter((n) => n.data.cls.id !== id).concat(n));
                //             }
                //         } else {
                //             console.log(
                //                 "callback2: something weird",
                //                 aggrEntity,
                //                 entity,
                //                 entities[aggrEntity?.id ?? ""]
                //             );
                //         }
                //         continue;
                //     }
                //     const e = getEdge(entity);
                //     console.log("callback2: is rel or gen", entity, e);
                //     if (e) {
                //         setEdges((prev) => prev.filter((e) => e.id !== id).concat(e));
                //     }
                // } else {
                //     console.error("callback2 unknown entity type", id, entity, visualEntity);
                //     throw new Error("unknown entity type");
                // }
            }

            for (const { id, aggregatedEntity: entity, visualEntity: ve } of updated) {
                const visualEntity = ve ?? entities[id]?.visualEntity ?? null; // FIXME: tohle je debilni, v updated by uz mohla behat visual informace
                if (isSemanticModelClass(entity)) {
                    const n = getNode(entity, visualEntity);
                    console.log("callback2: is entity", entity, n);
                    if (n == "hide-it!") {
                        setNodes((prev) => prev.filter((node) => node.data.cls.id !== id));
                    } else if (n) {
                        setNodes((prev) => prev.filter((n) => n.data.cls.id !== id).concat(n));
                    }
                } else if (isSemanticModelRelationship(entity) || isSemanticModelGeneralization(entity)) {
                    if (isSemanticModelRelationship(entity) && isAttribute(entity)) {
                        // it is an attribute, rerender the node that the attribute comes form
                        const aggrEntityOfAttributesNode =
                            entities[entity.ends[0]?.concept ?? ""]?.aggregatedEntity ?? null;
                        if (isSemanticModelClass(aggrEntityOfAttributesNode)) {
                            // TODO: omg, localAttributes jeste v sobe nemaj ten novej atribut, tak ho se musim jeste pridat 🤦
                            localAttributes.push(entity);
                            const visEntityOfAttributesNode = entities[aggrEntityOfAttributesNode.id]?.visualEntity;
                            const n = getNode(aggrEntityOfAttributesNode, visEntityOfAttributesNode ?? null);
                            console.log("visualization: is attribute: after get node", n, localAttributes);
                            if (n) {
                                setNodes((prev) => prev.filter((n) => n.data.cls.id !== id).concat(n));
                            }
                        } else {
                            console.log(
                                "callback2: something weird",
                                aggrEntityOfAttributesNode,
                                entity,
                                entities[aggrEntityOfAttributesNode?.id ?? ""]
                            );
                        }
                        continue;
                    }
                    const sourceModel = [...localModels.values()].find((m) =>
                        [...Object.entries(m.getEntities())].find((e) => e[1].id == entity.id)
                    );
                    if (!sourceModel?.getId()) {
                        console.error("didnt find model that has entity", entity, sourceModel, localClasses);
                        continue;
                    }
                    const e = getEdge(entity, activeVisualModel?.getColor(sourceModel.getId()));
                    console.log("callback2: is rel or gen", entity, e);
                    // if (e) {
                    //     setEdges((prev) => prev.filter((e) => e.id !== id).concat(e));
                    // }
                } else {
                    console.error("callback2 unknown entity type", id, entity, visualEntity);
                    throw new Error("unknown entity type");
                }
            }

            const rerenderAllEdges = () => {
                const relOrGenToModel = new Map<string, string>();
                for (const [modelId, model] of localModels.entries()) {
                    for (const entityId in model.getEntities()) {
                        relOrGenToModel.set(entityId, modelId);
                    }
                }

                const es = [...localRelationships, ...localGeneralizations]
                    .map((relOrGen) =>
                        getEdge(relOrGen, activeVisualModel?.getColor(relOrGenToModel.get(relOrGen.id)!))
                    )
                    .filter((e): e is Edge => e?.id != undefined);
                setEdges(es);
            };
            rerenderAllEdges();
        };

        const callToUnsubscribe2 = aggregatorView.subscribeToChanges(aggregatorCallback);
        const callToUnsubscribe3 = aggregatorView
            .getActiveVisualModel()
            ?.subscribeToChanges((updated: Record<string, VisualEntity>, removed: string[]) => {
                const entities = aggregatorView.getEntities();
                const updatedAsAggrEntityWrappers = Object.entries(updated).map(
                    ([uId, visualEntity]) =>
                        ({
                            id: visualEntity.sourceEntityId,
                            aggregatedEntity: entities[visualEntity.sourceEntityId]?.aggregatedEntity ?? null,
                            visualEntity: visualEntity,
                        } as AggregatedEntityWrapper)
                );
                aggregatorCallback(updatedAsAggrEntityWrappers, removed);
            });

        aggregatorCallback([], []);

        return () => {
            callToUnsubscribe2?.();
            callToUnsubscribe3?.();
        };
    }, [aggregatorView, classes /* changed when new view is used */]);

    useEffect(() => {
        console.log("!!!!! active visual model changed");
        setNodes([]);
        setEdges([]);
        const modelId = [...models.keys()].at(0)!;
        activeVisualModel?.setColor(modelId, activeVisualModel.getColor(modelId)); // fixme: jak lip vyvolat change na vsech entitach? 😅
    }, [activeVisualModel]);

    const handleNodeChanges = (changes: NodeChange[]) => {
        for (const change of changes) {
            if (change.type == "position") {
                // FIXME: maybe optimize so that it doesn't update every pixel
                change.positionAbsolute &&
                    activeVisualModel?.updateEntity(change.id, { position: change.positionAbsolute });
            }
        }
    };

    console.log("visualization: rerendered");

    return (
        <>
            {isCreateConnectionDialogOpen && <CreateConnectionDialog />}
            <div className="h-full w-full">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    onNodesChange={(changes: NodeChange[]) => {
                        onNodesChange(changes);
                        handleNodeChanges(changes);
                    }}
                    onEdgesChange={(changes: EdgeChange[]) => {
                        onEdgesChange(changes);
                    }}
                    onConnect={onConnect}
                    snapGrid={[20, 20]}
                    snapToGrid={true}
                >
                    <Controls />
                    <MiniMap
                        nodeColor={miniMapNodeColor}
                        style={{ borderStyle: "solid", borderColor: "#5438dc", borderWidth: "2px" }}
                    />
                    <Background gap={12} size={1} />
                </ReactFlow>
            </div>
        </>
    );
};

const miniMapNodeColor = (node: Node) => {
    return tailwindColorToHex.get(node.data?.color) ?? "#e9e9e9";
};
