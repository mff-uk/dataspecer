import ReactFlow, {
    Background,
    Connection,
    Controls,
    Edge,
    EdgeChange,
    MiniMap,
    Node,
    NodeChange,
    Panel,
    Position,
    useEdgesState,
    useNodesState,
} from "reactflow";
import { useMemo, useCallback, useEffect } from "react";
import { ClassCustomNode, semanticModelClassToReactFlowNode } from "./reactflow/class-custom-node";
import {
    SimpleFloatingEdge,
    semanticModelClassUsageToReactFlowEdge,
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
    SemanticModelClassUsage,
    SemanticModelRelationshipUsage,
    isSemanticModelClassUsage,
    isSemanticModelRelationshipUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { layout, graphlib } from "@dagrejs/dagre";

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = "TB") => {
    const dagreGraph = new graphlib.Graph();
    const isHorizontal = direction === "LR";
    dagreGraph.setGraph({ rankdir: direction });

    const fallbackNodeWidth = 150,
        fallbackNodeHeight = 100;

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, {
            width: node.width ?? fallbackNodeWidth,
            height: node.height ?? fallbackNodeHeight,
        });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    console.log(dagreGraph);
    layout(dagreGraph);

    nodes.forEach((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        node.targetPosition = isHorizontal ? Position.Left : Position.Top;
        node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

        // We are shifting the dagre node position (anchor=center center) to the top left
        // so it matches the React Flow node anchor point (top left).
        node.position = {
            x: nodeWithPosition.x - (node.width ?? fallbackNodeWidth) / 2,
            y: nodeWithPosition.y - (node.height ?? fallbackNodeHeight) / 2,
        };

        return node;
    });

    console.log(nodes);

    return { nodes, edges };
};

export const Visualization = () => {
    const { aggregatorView, models } = useModelGraphContext();
    const { CreateConnectionDialog, isCreateConnectionDialogOpen, openCreateConnectionDialog } =
        useCreateConnectionDialog();
    const { EntityDetailDialog, isEntityDetailDialogOpen, openEntityDetailDialog } = useEntityDetailDialog();
    const { ModifyEntityDialog, isModifyEntityDialogOpen, openModifyEntityDialog } = useModifyEntityDialog();

    const { classes, classes2, relationships, /* attributes, */ generalizations, profiles, sourceModelOfEntityMap } =
        useClassesContext();

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
        color: string | undefined,
        openEntityDetailDialog: (
            entity: SemanticModelRelationship | SemanticModelRelationshipUsage | SemanticModelGeneralization
        ) => void
    ): Edge | undefined => {
        if (isSemanticModelRelationshipUsage(entity)) {
            const usageNotes = entity.usageNote ? [entity.usageNote] : [];
            return semanticModelRelationshipToReactFlowEdge(entity, color, usageNotes, () =>
                openEntityDetailDialog(entity)
            ) as Edge;
        } else if (isSemanticModelRelationship(entity)) {
            return semanticModelRelationshipToReactFlowEdge(entity, color, [], () =>
                openEntityDetailDialog(entity)
            ) as Edge;
        } else if (isSemanticModelGeneralization(entity)) {
            console.log("got generalization to make it a rf edege");
            return semanticModelGeneralizationToReactFlowEdge(entity, color, () =>
                openEntityDetailDialog(entity)
            ) as Edge;
        }
        return;
    };
    const classUsageToEdgeType = (entity: SemanticModelClassUsage, color: string | undefined): Edge => {
        const res = semanticModelClassUsageToReactFlowEdge(entity, color, () => openEntityDetailDialog(entity));
        return res;
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
            console.log("callToUnsubscribe2 u&r:", updated, removed);

            const localActiveVisualModel = aggregatorView.getActiveVisualModel();
            const entities = aggregatorView.getEntities();
            const [localRelationships, localGeneralizations, localModels] = [relationships, generalizations, models];
            let [localAttributes] = [relationships.filter(isAttribute)];

            const getNode = (cls: SemanticModelClass | SemanticModelClassUsage, visualEntity: VisualEntity | null) => {
                const pos = visualEntity?.position;
                const visible = visualEntity?.visible;
                if (!cls || !pos) {
                    return;
                }
                if (!visible) {
                    return "hide-it!";
                }
                // let originModelId = localClasses.get(cls.id)?.origin;
                // let originModelId = sourceModelOfEntity(cls.id, localModelsAsAnArray)?.getId(); // ocalClasses.get(cls.id)?.origin;
                let originModelId = sourceModelOfEntityMap.get(cls.id); // ocalClasses.get(cls.id)?.origin;

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

                const attributes = localAttributes.filter((attr) => attr.ends[0]?.concept == cls.id);
                const idsOfAttributes = attributes.map((a) => a.id);
                const profilesOfAttributes = profiles
                    .filter((p) => idsOfAttributes.includes(p.usageOf))
                    .filter((p): p is SemanticModelClassUsage => isSemanticModelRelationshipUsage(p));
                const attributeProfiles = profiles
                    .filter(isSemanticModelRelationshipUsage)
                    .filter((attr) => attr.ends[0]?.concept == cls.id && !attr.ends[1]?.concept);

                // const usagesOfAttributes = attributes.map()
                return semanticModelClassToReactFlowNode(
                    cls.id,
                    cls,
                    pos,
                    originModelId ? localActiveVisualModel?.getColor(originModelId) : "#ffaa66", // colorForModel.get(UNKNOWN_MODEL_ID),
                    attributes,
                    openEntityDetailDialog,
                    (cls: SemanticModelClass) => openModifyEntityDialog(cls),
                    profilesOfAttributes,
                    attributeProfiles
                );
            };

            const getEdge = (
                relOrGen: SemanticModelRelationship | SemanticModelGeneralization | SemanticModelRelationshipUsage,
                color: string | undefined
            ) => {
                return relationshipOrGeneralizationToEdgeType(relOrGen, color, openEntityDetailDialog);
            };

            if (removed.length > 0) {
                // --- removed entities --- --- ---
                const [affectedNodeIds, nodesAffectedByAttributeRemovals] = localAttributes
                    .filter((a) => removed.includes(a.id))
                    .map((a) => {
                        const aggregatedEntityOfAttributesNode =
                            entities[a.ends[0]?.concept ?? ""]?.aggregatedEntity ?? null;
                        const visualEntityOfAttributesNode =
                            entities[aggregatedEntityOfAttributesNode?.id ?? ""]?.visualEntity;
                        localAttributes = localAttributes.filter((la) => la.id != a.id);

                        if (
                            isSemanticModelClass(aggregatedEntityOfAttributesNode) ||
                            isSemanticModelClassUsage(aggregatedEntityOfAttributesNode)
                        ) {
                            const n = getNode(aggregatedEntityOfAttributesNode, visualEntityOfAttributesNode ?? null);
                            if (n && n != "hide-it!") {
                                return [n.id, n];
                            }
                        }
                        return null;
                    })
                    .filter((n): n is [string, Node] => n != null)
                    .reduce(
                        ([ids, nodes], curr) => {
                            return [ids.add(curr[0]), nodes.concat(curr[1])];
                        },
                        [new Set<string>(), [] as Node[]]
                    );
                setNodes((n) =>
                    n
                        .filter((v) => !removed.includes(v.id) && !affectedNodeIds.has(v.id))
                        .concat(nodesAffectedByAttributeRemovals)
                );
                console.log(removed, affectedNodeIds, nodesAffectedByAttributeRemovals);
            }

            for (const { id, aggregatedEntity: entity, visualEntity: ve } of updated) {
                const visualEntity = ve ?? entities[id]?.visualEntity ?? null; // FIXME: tohle je debilni, v updated by uz mohla behat visual informace
                if (isSemanticModelClass(entity) || isSemanticModelClassUsage(entity)) {
                    const n = getNode(entity, visualEntity);
                    if (n == "hide-it!") {
                        console.log("hiding node", n);
                        setNodes((prev) => prev.filter((node) => node.data.cls.id !== id));
                    } else if (n) {
                        console.log("adding node", n);
                        setNodes((prev) => prev.filter((n) => n.data.cls.id !== id).concat(n));
                    }
                } else if (
                    isSemanticModelRelationship(entity) ||
                    isSemanticModelGeneralization(entity) ||
                    isSemanticModelRelationshipUsage(entity)
                ) {
                    if (
                        (isSemanticModelRelationship(entity) || isSemanticModelRelationshipUsage(entity)) &&
                        isAttribute(entity)
                    ) {
                        // it is an attribute, rerender the node that the attribute comes form
                        const aggrEntityOfAttributesNode =
                            entities[entity.ends[0]?.concept ?? ""]?.aggregatedEntity ?? null;
                        if (
                            isSemanticModelClass(aggrEntityOfAttributesNode) ||
                            isSemanticModelClassUsage(aggrEntityOfAttributesNode)
                        ) {
                            // TODO: omg, localAttributes jeste v sobe nemaj ten novej atribut, tak ho se musim jeste pridat 🤦
                            localAttributes.push(entity);
                            const visEntityOfAttributesNode = entities[aggrEntityOfAttributesNode.id]?.visualEntity;
                            const n = getNode(aggrEntityOfAttributesNode, visEntityOfAttributesNode ?? null);
                            if (n && n != "hide-it!") {
                                console.log("adding node due to attribute", n);
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
                } else {
                    console.error("callback2 unknown entity type", id, entity, visualEntity);
                    throw new Error("unknown entity type");
                }
            }

            const rerenderAllEdges = () => {
                const es = [
                    ...localRelationships,
                    ...localGeneralizations,
                    ...profiles.filter(isSemanticModelRelationshipUsage),
                ]
                    .map((relOrGen) =>
                        getEdge(
                            relOrGen,
                            localActiveVisualModel?.getColor(
                                // sourceModelOfEntity(relOrGen.id, localModelsAsAnArray)?.getId()
                                sourceModelOfEntityMap.get(relOrGen.id) ?? "some random model id that doesn't exist"
                            )
                        )
                    )
                    .filter((e): e is Edge => {
                        console.log("e undefined?", e);
                        return e?.id != undefined;
                    })
                    .concat(
                        [...profiles].filter(isSemanticModelClassUsage).map((u) =>
                            classUsageToEdgeType(
                                u,
                                localActiveVisualModel?.getColor(
                                    // sourceModelOfEntity(relOrGen.id, localModelsAsAnArray)?.getId()
                                    sourceModelOfEntityMap.get(u.id) ?? "some random model id that doesn't exist"
                                    // relOrGenToModel.get(u.id)!)
                                )
                            )
                        )
                    );

                setEdges(es);
            };
            rerenderAllEdges();
        };

        const callToUnsubscribe2 = aggregatorView.subscribeToChanges(aggregatorCallback);
        const callToUnsubscribe3 = aggregatorView
            .getActiveVisualModel()
            ?.subscribeToChanges((updated: Record<string, VisualEntity>, removed: string[]) => {
                console.log("callToUnsubscribe3 u&r:", updated, removed);
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
            // callToUnsubscribe3?.();
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
                    <Panel position="top-right">
                        <button
                            onClick={() => {
                                const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
                                    nodes,
                                    edges,
                                    "LR"
                                );

                                setNodes([...layoutedNodes]);
                                setEdges([...layoutedEdges]);
                            }}
                        >
                            layout
                        </button>
                    </Panel>
                    <Background gap={12} size={1} />
                </ReactFlow>
            </div>
        </>
    );
};

const miniMapNodeColor = (node: Node) => {
    return tailwindColorToHex(node.data?.color);
};
