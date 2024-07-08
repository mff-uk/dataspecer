import ReactFlow, {
    type Connection,
    type Edge,
    type EdgeChange,
    type Node,
    type NodeChange,
    type ReactFlowInstance,
    type XYPosition,
    Background,
    Controls,
    MiniMap,
    Panel,
    getRectOfNodes,
    getTransformForBounds,
    useEdgesState,
    useNodesState,
} from "reactflow";
import { useMemo, useCallback, useEffect, useState } from "react";
import {
    type ClassCustomNodeDataType,
    ClassCustomNode,
    semanticModelClassToReactFlowNode,
} from "./reactflow/class-custom-node";
import {
    SimpleFloatingEdge,
    semanticModelClassUsageToReactFlowEdge,
    semanticModelGeneralizationToReactFlowEdge,
    semanticModelRelationshipToReactFlowEdge,
} from "./reactflow/simple-floating-edge";
import { tailwindColorToHex } from "../utils/color-utils";
import "reactflow/dist/style.css";
import { useCreateConnectionDialog } from "./dialog/create-connection-dialog";
import { useModelGraphContext } from "./context/model-context";
import {
    type SemanticModelClass,
    type SemanticModelGeneralization,
    type SemanticModelRelationship,
    isSemanticModelAttribute,
    isSemanticModelClass,
    isSemanticModelGeneralization,
    isSemanticModelRelationship,
} from "@dataspecer/core-v2/semantic-model/concepts";
import { useClassesContext } from "./context/classes-context";
import { type VisualEntity } from "@dataspecer/core-v2/visual-model";
import { type AggregatedEntityWrapper } from "@dataspecer/core-v2/semantic-model/aggregator";
import {
    type SemanticModelClassUsage,
    type SemanticModelRelationshipUsage,
    isSemanticModelAttributeUsage,
    isSemanticModelClassUsage,
    isSemanticModelRelationshipUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { getDomainAndRange } from "@dataspecer/core-v2/semantic-model/relationship-utils";
import { bothEndsHaveAnIri, temporaryDomainRangeHelper } from "./util/relationship-utils";
import { toSvg } from "html-to-image";
import { useDownload } from "./features/export/download";
import { useDialogsContext } from "./context/dialogs-context";
import { type Warning, useWarningsContext } from "./context/warnings-context";
import { getRandomName } from "../utils/random-gen";

// Function that returns SVG for the current model.
export let getSvgForCurrentView: () => Promise<{
    svg: string;
    forModelId: string;
} | null>;

export const Visualization = () => {
    const { aggregatorView, models } = useModelGraphContext();
    const { CreateConnectionDialog, isCreateConnectionDialogOpen, openCreateConnectionDialog } =
        useCreateConnectionDialog();
    const { openCreateClassDialog } = useDialogsContext();

    const { downloadImage } = useDownload();

    const { classes, relationships, generalizations, profiles, sourceModelOfEntityMap } = useClassesContext();
    const { setWarnings } = useWarningsContext();

    const activeVisualModel = useMemo(() => aggregatorView.getActiveVisualModel(), [aggregatorView]);

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const nodeTypes = useMemo(() => ({ classCustomNode: ClassCustomNode }), []);
    const edgeTypes = useMemo(() => ({ floating: SimpleFloatingEdge }), []);

    const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

    // --- handlers --- --- ---

    const handleAddEntityToActiveView = useCallback(
        (entityId: string, position?: XYPosition) => {
            const updateStatus = activeVisualModel?.updateEntity(entityId, { visible: true, position });
            if (!updateStatus) {
                activeVisualModel?.addEntity({ sourceEntityId: entityId, position });
            }
        },
        [activeVisualModel]
    );

    const onConnect = useCallback(
        (connection: Connection) => {
            openCreateConnectionDialog(connection);
        },
        [openCreateConnectionDialog]
    );

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const type = event.dataTransfer.getData("application/reactflow");
            const entityId = event.dataTransfer.getData("application/reactflow-entityId");

            // check if the dropped element is valid
            if (typeof type === "undefined" || !type) {
                return;
            }

            // reactFlowInstance.project was renamed to reactFlowInstance.screenToFlowPosition
            // and you don't need to subtract the reactFlowBounds.left/top anymore
            // details: https://reactflow.dev/whats-new/2023-11-10
            const position = reactFlowInstance?.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            console.log("on drop handler", event, reactFlowInstance, event.dataTransfer, type, entityId, position);
            handleAddEntityToActiveView(entityId, position);
        },
        [reactFlowInstance, handleAddEntityToActiveView]
    );

    const onPaneClick = useCallback(
        (e: React.MouseEvent) => {
            if (e.altKey) {
                const position = reactFlowInstance?.screenToFlowPosition({
                    x: e.clientX,
                    y: e.clientY,
                });
                openCreateClassDialog(undefined, {
                    x: position?.x ?? e.nativeEvent.layerX,
                    y: position?.y ?? e.nativeEvent.layerY,
                });
            }
        },
        [reactFlowInstance, openCreateClassDialog]
    );

    const getCurrentClassesRelationshipsGeneralizationsAndProfiles = () => {
        return {
            classes,
            relationships,
            attributes: relationships.filter(isSemanticModelAttribute),
            generalizations,
            profiles,
            profileAttributes: profiles.filter(isSemanticModelAttributeUsage),
            models,
        };
    };

    // --- mappers from concepts to visualization elements --- --- ---

    const rerenderEverythingOnCanvas = () => {
        const modelId = [...models.keys()].at(0);
        if (!modelId) {
            return;
        }
        activeVisualModel?.setColor(modelId, activeVisualModel.getColor(modelId) ?? "69ff69"); // FIXME: a better way to make all edges rerender?
    };

    const getSvg = () => {
        // we calculate a transform for the nodes so that all nodes are visible
        // we then overwrite the transform of the `.react-flow__viewport` element
        // with the style option of the html-to-image library
        const imageWidth = 800,
            imageHeight = 550;
        const nodesBounds = getRectOfNodes(nodes);
        const transform = getTransformForBounds(nodesBounds, imageWidth, imageHeight, 0.5, 2);

        const flow__viewport = document.querySelector(".react-flow__viewport") as HTMLElement | null;

        if (!flow__viewport) {
            return;
        }

        return toSvg(flow__viewport, {
            backgroundColor: "#ffffff",
            width: imageWidth,
            height: imageHeight,
            style: {
                width: imageWidth.toString(),
                height: imageHeight.toString(),
                transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`,
            },
        });
    };

    const exportCanvasToSvg = () => {
        const svg = getSvg();
        if (svg) {
            svg.then(downloadImage).catch(console.error);
        }
    };

    getSvgForCurrentView = () => getSvg()?.then((svg) => {
        return {
            svg: svg,
            forModelId: activeVisualModel?.getId() ?? "",
        };
    }) ?? Promise.resolve(null);

    // register a callback with aggregator for visualization
    // - remove what has been removed from the visualization state
    // - update entities that have been updated
    //   - rerender updated classes
    //   - if they have updated attributes, update them as well
    //   - collect updated relationships and relationship profiles - rerender them after classes are on the canvas
    // the callback is registered for twice
    // - first time for the semantic information about the models
    //   - new relationship between two classes
    //   - new attribute for a class
    //   - rename of a concept
    // - second time for the visual information from the active visual model
    //   - change of visibility, position
    useEffect(() => {
        const aggregatorCallback = (updated: AggregatedEntityWrapper[], removed: string[]) => {
            const localActiveVisualModel = aggregatorView.getActiveVisualModel();
            const entities = aggregatorView.getEntities();
            let {
                relationships: localRelationships,
                attributes: localAttributes,
                generalizations: localGeneralizations,
                profiles: localProfiles,
                profileAttributes: localAttributeProfiles,
                models: localModels, // eslint-disable-line prefer-const
            } = getCurrentClassesRelationshipsGeneralizationsAndProfiles();

            const getNode = (cls: SemanticModelClass | SemanticModelClassUsage, visualEntity: VisualEntity | null) => {
                if (!visualEntity) {
                    return;
                }
                const pos = visualEntity.position;
                const visible = visualEntity.visible;
                if (!cls || !pos) {
                    return;
                }
                if (!visible) {
                    return "hide-it!";
                }
                let originModelId = sourceModelOfEntityMap.get(cls.id);

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

                const attributes = localAttributes
                    .filter(isSemanticModelAttribute)
                    .filter((attr) => getDomainAndRange(attr)?.domain.concept == cls.id);
                const attributeProfiles = localAttributeProfiles
                    .filter(isSemanticModelAttributeUsage)
                    .filter((attr) => temporaryDomainRangeHelper(attr)?.domain.concept == cls.id);

                return semanticModelClassToReactFlowNode(
                    cls.id,
                    cls,
                    pos,
                    originModelId ? localActiveVisualModel?.getColor(originModelId) : "#ffaa66", // colorForModel.get(UNKNOWN_MODEL_ID),
                    attributes,
                    attributeProfiles
                );
            };

            const getEdge = (
                entity: SemanticModelRelationship | SemanticModelGeneralization | SemanticModelRelationshipUsage | SemanticModelClassUsage,
                color: string | undefined
            ) => {
                if (isSemanticModelRelationshipUsage(entity)) {
                    const usageNotes = entity.usageNote ? [entity.usageNote] : [];
                    return semanticModelRelationshipToReactFlowEdge(entity, color, usageNotes) as Edge;
                } else if (isSemanticModelRelationship(entity)) {
                    return semanticModelRelationshipToReactFlowEdge(entity, color, []) as Edge;
                } else if (isSemanticModelGeneralization(entity)) {
                    return semanticModelGeneralizationToReactFlowEdge(entity, color) as Edge;
                } else if (isSemanticModelClassUsage(entity)) {
                    return semanticModelClassUsageToReactFlowEdge(entity, color);
                }
                return;
            };

            if (removed.length > 0) {
                // --- removed entities --- --- ---
                const [affectedNodeIds, nodesAffectedByAttributeRemovals] = [
                    ...localAttributes,
                    ...localAttributeProfiles,
                ]
                    .filter((a) => removed.includes(a.id))
                    .map((a) => {
                        const aggregatedEntityOfAttributesNode =
                            entities[temporaryDomainRangeHelper(a)?.domain.concept ?? ""]?.aggregatedEntity ?? null;
                        const visualEntityOfAttributesNode =
                            entities[aggregatedEntityOfAttributesNode?.id ?? ""]?.visualEntity;
                        localAttributes = localAttributes.filter((la) => la.id != a.id);
                        localAttributeProfiles = localAttributeProfiles.filter((lap) => lap.id != a.id);

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
                localGeneralizations = localGeneralizations.filter((g) => !removed.includes(g.id));
                localRelationships = localRelationships.filter((r) => !removed.includes(r.id));
                localProfiles = localProfiles.filter((p) => !removed.includes(p.id));
                setNodes((n) =>
                    n
                        .filter((v) => !removed.includes(v.id) && !affectedNodeIds.has(v.id))
                        .concat(nodesAffectedByAttributeRemovals)
                );
            }

            for (const { id, aggregatedEntity: entity, visualEntity: ve } of updated) {
                if (entity == null) {
                    continue;
                }
                const visualEntity = ve ?? entities[id]?.visualEntity ?? null;
                if (isSemanticModelClass(entity) || isSemanticModelClassUsage(entity)) {
                    const n = getNode(entity, visualEntity);
                    if (n == "hide-it!") {
                        setNodes((prev) => prev.filter((n) => (n.data as ClassCustomNodeDataType).cls.id !== id));
                    } else if (n) {
                        setNodes((prev) =>
                            prev.filter((n) => (n.data as ClassCustomNodeDataType).cls.id !== id).concat(n)
                        );
                    }
                } else if (isSemanticModelAttribute(entity) || isSemanticModelAttributeUsage(entity)) {
                    if (bothEndsHaveAnIri(entity)) {
                        console.warn("both ends have an IRI, skipping", entity, entity.ends);
                        alert("both ends have an IRI, skipping");
                        continue;
                    }
                    // it is an attribute, rerender the node that the attribute comes form
                    const domainOfAttribute = temporaryDomainRangeHelper(entity)?.domain.concept;
                    const aggregatedEntityOfAttributesNode =
                        entities[domainOfAttribute ?? entity.ends[0]?.concept ?? ""]?.aggregatedEntity ?? null;

                    if (
                        isSemanticModelClass(aggregatedEntityOfAttributesNode) ||
                        isSemanticModelClassUsage(aggregatedEntityOfAttributesNode)
                    ) {
                        // LOL, local attributes & attribute profiles are missing the new attribute, needs to be added
                        if (isSemanticModelRelationship(entity)) {
                            // remove the existing version of attribute, use this updated one
                            localAttributes = localAttributes.filter((v) => v.id != entity.id).concat(entity);
                        } else {
                            // remove the existing version of attribute, use this updated one
                            localAttributeProfiles = localAttributeProfiles
                                .filter((v) => v.id != entity.id)
                                .concat(entity);
                        }

                        const visEntityOfAttributesNode = entities[aggregatedEntityOfAttributesNode.id]?.visualEntity;
                        const n = getNode(aggregatedEntityOfAttributesNode, visEntityOfAttributesNode ?? null);
                        if (n && n != "hide-it!") {
                            setNodes((prev) =>
                                prev.filter((n) => (n.data as ClassCustomNodeDataType).cls.id !== id).concat(n)
                            );
                        }
                    } else {
                        console.log(
                            "callback2: something weird",
                            aggregatedEntityOfAttributesNode,
                            entity,
                            entities[aggregatedEntityOfAttributesNode?.id ?? ""]
                        );
                    }
                    continue;
                } else if (isSemanticModelRelationship(entity)) {
                    localRelationships = localRelationships.filter((r) => r.id != entity.id).concat(entity);
                } else if (isSemanticModelRelationshipUsage(entity)) {
                    localProfiles = localProfiles.filter((p) => p.id != entity.id).concat(entity);
                } else if (isSemanticModelGeneralization(entity)) {
                    localGeneralizations = localGeneralizations.filter((g) => g.id != entity.id).concat(entity);
                } else {
                    console.error("callback2 unknown entity type", id, entity, visualEntity);
                    setWarnings((prev) =>
                        prev.concat({
                            message: "unknown entity type in visualization update",
                            id: getRandomName(15),
                            object: { entity, visualEntity },
                            type: "unknown-entity-type",
                        } as Warning)
                    );
                }
            }

            const rerenderAllEdges = () => {
                const visualEntities = aggregatorView.getActiveVisualModel()?.getVisualEntities();
                const edgesToRender = [
                    ...localRelationships,
                    ...localGeneralizations,
                    ...localProfiles.filter(isSemanticModelRelationshipUsage),
                    ...localProfiles.filter(isSemanticModelClassUsage),
                ]
                    .map((entity) => {
                        const visible = visualEntities?.get(entity.id)?.visible ?? true;
                        if (!visible) {
                            return;
                        }
                        const sourceModelId = sourceModelOfEntityMap.get(entity.id);
                        return getEdge(
                            entity,
                            sourceModelId === undefined ? undefined : (localActiveVisualModel?.getColor(sourceModelId) ?? undefined)
                        );
                    })
                    .filter((edge): edge is Edge => edge?.id !== undefined);
                setEdges(edgesToRender);
            };
            rerenderAllEdges();
        };

        const callToUnsubscribeSemanticAggregatorCallback = aggregatorView.subscribeToChanges(aggregatorCallback);
        const callToUnsubscribeCanvasCallback = aggregatorView
            .getActiveVisualModel()
            ?.subscribeToChanges((updated: Record<string, VisualEntity>, removed: string[]) => {
                const entities = aggregatorView.getEntities();
                const updatedAsAggregatedEntityWrappers = Object.entries(updated).map(([_, visualEntity]) => {
                    return {
                        id: visualEntity.sourceEntityId,
                        aggregatedEntity: entities[visualEntity.sourceEntityId]?.aggregatedEntity ?? null,
                        visualEntity: visualEntity,
                    } as AggregatedEntityWrapper;
                });
                aggregatorCallback(updatedAsAggregatedEntityWrappers, removed);
            });

        aggregatorCallback([], []);

        return () => {
            callToUnsubscribeSemanticAggregatorCallback?.();
            callToUnsubscribeCanvasCallback?.();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [aggregatorView, classes /* changed when new view is used */]);

    // clear the canvas on view change
    useEffect(() => {
        console.log("visualization: active visual model changed", activeVisualModel);
        setNodes([]);
        setEdges([]);
        rerenderEverythingOnCanvas();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeVisualModel]);

    const handleNodeChanges = (changes: NodeChange[]) => {
        for (const change of changes) {
            if (change.type == "position") {
                change.positionAbsolute &&
                    activeVisualModel?.updateEntity(change.id, { position: change.positionAbsolute });
            }
        }
    };

    return (
        <>
            {isCreateConnectionDialogOpen && <CreateConnectionDialog />}

            <div className="h-[80vh] w-full md:h-full">
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
                    onDragOver={onDragOver}
                    onDrop={onDrop}
                    snapToGrid={true}
                    onInit={(reactFlowInstance) => setReactFlowInstance(reactFlowInstance)}
                    onPaneClick={onPaneClick}
                >
                    <Controls />
                    <MiniMap
                        nodeColor={miniMapNodeColor}
                        style={{ borderStyle: "solid", borderColor: "#5438dc", borderWidth: "2px" }}
                    />
                    <Panel position="top-right">
                        <div className="flex flex-row-reverse">
                            <div className="cursor-help" title="add class to canvas by clicking and holding `alt`">
                                ℹ
                            </div>
                            <div className="mx-1">
                                <button title="download svg of the canvas" onClick={exportCanvasToSvg}>
                                    🖼
                                </button>
                            </div>
                        </div>
                    </Panel>
                    <Background gap={12} size={1} />
                </ReactFlow>
            </div>
        </>
    );
};

const miniMapNodeColor = (node: Node) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
    return tailwindColorToHex(node.data?.color);
};
