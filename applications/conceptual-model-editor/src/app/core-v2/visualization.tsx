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
import { isAttribute } from "./util/utils";
import { tailwindColorToHex } from "../utils/color-utils";

import "reactflow/dist/style.css";
import { useCreateConnectionDialog } from "./dialog/create-connection-dialog";
import { useModelGraphContext } from "./context/model-context";
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

import { useEntityDetailDialog } from "./dialog/entity-detail-dialog";
import { useModifyEntityDialog } from "./dialog/modify-entity-dialog";
import { AggregatedEntityWrapper } from "@dataspecer/core-v2/semantic-model/aggregator";
import {
    isSemanticModelClassUsage,
    isSemanticModelRelationshipUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";

export const Visualization = () => {
    const { aggregatorView, models } = useModelGraphContext();
    const { CreateConnectionDialog, isCreateConnectionDialogOpen, openCreateConnectionDialog } =
        useCreateConnectionDialog();
    const { EntityDetailDialog, isEntityDetailDialogOpen, openEntityDetailDialog } = useEntityDetailDialog();
    const { ModifyEntityDialog, isModifyEntityDialogOpen, openModifyEntityDialog } = useModifyEntityDialog();

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

    const rerenderEverythingOnCanvas = () => {
        const modelId = [...models.keys()].at(0);
        if (!modelId) {
            return;
        }
        activeVisualModel?.setColor(modelId, activeVisualModel.getColor(modelId)!); // fixme: jak lip vyvolat change na vsech entitach? 😅
    };

    useEffect(() => {
        const aggregatorCallback = (updated: AggregatedEntityWrapper[], removed: string[]) => {
            const localActiveVisualModel = aggregatorView.getActiveVisualModel();
            const entities = aggregatorView.getEntities();
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
                if (!cls || !pos) {
                    return;
                }
                if (!visible) {
                    return "hide-it!";
                }
                let originModelId = localClasses.get(cls.id)?.origin;
                if (!originModelId) {
                    // just try to find the model directly
                    const modelId = [...localModels.values()]
                        .find((m) => {
                            const c = m.getEntities()[cls.id];
                            if (c) return true;
                        })
                        ?.getId();
                    if (modelId) {
                        originModelId = modelId;
                    }
                }
                return semanticModelClassToReactFlowNode(
                    cls.id,
                    cls,
                    pos,
                    originModelId ? localActiveVisualModel?.getColor(originModelId) : "#ffaa66", // colorForModel.get(UNKNOWN_MODEL_ID),
                    localAttributes.filter((attr) => attr.ends[0]?.concept == cls.id).map((attr) => attr.ends[1]!),
                    openEntityDetailDialog,
                    (cls: SemanticModelClass) => openModifyEntityDialog(cls)
                );
            };

            const getEdge = (
                relOrGen: SemanticModelRelationship | SemanticModelGeneralization,
                color: string | undefined
            ) => {
                return relationshipOrGeneralizationToEdgeType(relOrGen, color);
            };

            for (const r in removed) {
                // todo
            }
            console.log(removed);

            for (const { id, aggregatedEntity: entity, visualEntity: ve } of updated) {
                const visualEntity = ve ?? entities[id]?.visualEntity ?? null; // FIXME: tohle je debilni, v updated by uz mohla behat visual informace
                if (isSemanticModelClass(entity)) {
                    const n = getNode(entity, visualEntity);
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
                            if (n && n != "hide-it!") {
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
                } else if (isSemanticModelClassUsage(entity) || isSemanticModelRelationshipUsage(entity)) {
                    console.log("got usage, skipping", entity);
                    continue;
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
                        getEdge(relOrGen, localActiveVisualModel?.getColor(relOrGenToModel.get(relOrGen.id)!))
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
        console.log("visualization: active visual model changed", activeVisualModel);
        setNodes([]);
        setEdges([]);
        rerenderEverythingOnCanvas();
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

    return (
        <>
            {isCreateConnectionDialogOpen && <CreateConnectionDialog />}
            {isEntityDetailDialogOpen && <EntityDetailDialog />}
            {isModifyEntityDialogOpen && <ModifyEntityDialog />}

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
    return tailwindColorToHex(node.data?.color);
};
