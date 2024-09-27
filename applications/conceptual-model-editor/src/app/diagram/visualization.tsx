import { useMemo, useCallback, useEffect, useRef, Dispatch, SetStateAction, MutableRefObject } from "react";
import ReactFlow, {
    type Connection,
    type Edge,
    type EdgeChange,
    type Node,
    type NodeChange,
    type XYPosition,
    Background,
    Controls,
    MiniMap,
    Panel,
    ReactFlowInstance,
    getRectOfNodes,
    getTransformForBounds,
    useEdgesState,
    useNodesState,
    useOnSelectionChange,
    useReactFlow,
} from "reactflow";

import {
    type SemanticModelClass,
    type SemanticModelGeneralization,
    type SemanticModelRelationship,
    isSemanticModelAttribute,
    isSemanticModelClass,
    isSemanticModelGeneralization,
    isSemanticModelRelationship,
} from "@dataspecer/core-v2/semantic-model/concepts";
import {
    type SemanticModelClassUsage,
    type SemanticModelRelationshipUsage,
    isSemanticModelAttributeUsage,
    isSemanticModelClassUsage,
    isSemanticModelRelationshipUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { type WritableVisualModel, type VisualNode, isVisualNode, isVisualRelationship, VisualModel, VisualEntity } from "@dataspecer/core-v2/visual-model";
import { SemanticModelAggregatorView, type AggregatedEntityWrapper } from "@dataspecer/core-v2/semantic-model/aggregator";
import { getDomainAndRange } from "@dataspecer/core-v2/semantic-model/relationship-utils";


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
import { useCreateConnectionDialog } from "./dialog/create-connection-dialog";
import { useModelGraphContext } from "./context/model-context";
import { ClassesContextType, useClassesContext, UseClassesContextType } from "./context/classes-context";
import { bothEndsHaveAnIri, temporaryDomainRangeHelper } from "./util/relationship-utils";
import { toSvg } from "html-to-image";
import { useDownload } from "./features/export/download";
import { type Warning, WarningsContextType, useWarningsContext } from "./context/warnings-context";

import "reactflow/dist/style.css";
import { setHighlightingStylesBasedOnSelection } from "./reactflow/set-highlighting-styles";

/**
 * Returns SVG for the current model.
 */
export let getSvgForCurrentView: () => Promise<{
    svg: string;
    forModelId: string;
} | null>;

const NODE_TYPES = { classCustomNode: ClassCustomNode };

const EDGE_TYPES = { floating: SimpleFloatingEdge };

const DEFAULT_MODEL_COLOR = "#ffffff";

export const Visualization = () => {
    const { aggregatorView } = useModelGraphContext();
    const { CreateConnectionDialog, isCreateConnectionDialogOpen, openCreateConnectionDialog } = useCreateConnectionDialog();

    const { downloadImage } = useDownload();

    const classesContext = useClassesContext();
    const warningsContext = useWarningsContext();

    const activeVisualModel = useMemo(() => aggregatorView.getActiveVisualModel(), [aggregatorView]);
    const changedVisualModel = useRef<boolean>(true);

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    const reactFlowInstance = useReactFlow<object, object>();

    // HANDLERS

    const onConnect = useCallback((connection: Connection) => {
        openCreateConnectionDialog(connection);
    }, [openCreateConnectionDialog]);

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    }, []);

    const onDrop = useCallback((event: React.DragEvent) => {
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

        console.log("onDrop", { event });

        // TODO
        // handleAddEntityToActiveView(activeVisualModel, entityId, position);
    }, [reactFlowInstance, activeVisualModel]);

    const onNodeDragStop = (_: React.MouseEvent, node: Node, nodes: Node[]) => {
        updateVisualEntityIfNecessary(node, activeVisualModel as WritableVisualModel);
    };

    const onSelectionDragStop = (_: React.MouseEvent, nodes: Node[]) => {
        for (const node of nodes) {
            updateVisualEntityIfNecessary(node, activeVisualModel as WritableVisualModel);
        }
    };

    // EXPORT TO SVG : START

    const getSvg = () => {
        // we calculate a transform for the nodes so that all nodes are visible
        // we then overwrite the transform of the `.react-flow__viewport` element
        // with the style option of the html-to-image library
        const imageWidth = 800;
        const imageHeight = 550;
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

    // EXPORT TO SVG : END

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

        const unsubscribeSemanticAggregatorCallback = aggregatorView.subscribeToChanges((updated, removed) => {
            if (activeVisualModel === null) {
                // We do not have visual model yet, so we ignore the update.
                return;
            }
            console.log("[VISUALIZATION] Semantic entities has been changed.", { updated, removed });
            propagateAggregatorChangesToVisualization(
                updated, removed, activeVisualModel as WritableVisualModel, aggregatorView,
                classesContext, reactFlowInstance, setNodes, changedVisualModel);
        });

        const unsubscribeCanvasCallback = aggregatorView.getActiveVisualModel()?.subscribeToChanges({
            modelColorDidChange(model) {
                if (activeVisualModel === null) {
                    return;
                }
                // We ignore model color changes here for now.
                console.log("[VISUALIZATION] Model color has been changed.", { model });
                propagateVisualModelColorChangesToVisualization(
                    model,
                    setNodes, setEdges,
                    aggregatorView, classesContext,
                    activeVisualModel as WritableVisualModel);
            },
            visualEntitiesDidChange(changes) {
                if (activeVisualModel === null) {
                    return;
                }
                console.log("[VISUALIZATION] Visual entities has been changed.", { changes });
                propagateVisualModelEntitiesChangesToVisualization(
                    changes,
                    setNodes, setEdges,
                    aggregatorView, classesContext,
                    activeVisualModel as WritableVisualModel);
            },
        });

        return () => {
            unsubscribeSemanticAggregatorCallback?.();
            unsubscribeCanvasCallback?.();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [aggregatorView, classesContext.classes /* changed when new view is used */]);

    // Update canvas content on view change.
    useEffect(() => {
        console.log("[VISUALIZATION] Active visual model has changed.", activeVisualModel);
        changedVisualModel.current = true;
        if (activeVisualModel === null) {
            // Just remove all.
            setNodes([]);
            setEdges([]);
        } else {
            resetReactflowFromVisualModel(
                setNodes, setEdges,
                aggregatorView, classesContext,
                activeVisualModel as WritableVisualModel);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeVisualModel]);



    // Based on https://reactflow.dev/api-reference/hooks/use-on-selection-change
    // ... Alternativně onSelectionChange zaregistrovaný na Reactflow komponentě - asi to je stejný
    type SelectCallbackParametersType = {
        nodes: Node[],
        edges: Edge[]
    };

    const onChange = useCallback(({ nodes, edges }: SelectCallbackParametersType) => {
        setHighlightingStylesBasedOnSelection(nodes, edges, setNodes, setEdges);
    }, []);

    useOnSelectionChange({
        onChange,
    });

    return (
        <>
            {isCreateConnectionDialogOpen && <CreateConnectionDialog />}
            <div className="h-[80vh] w-full md:h-full">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={NODE_TYPES}
                    edgeTypes={EDGE_TYPES}
                    onNodesChange={(changes: NodeChange[]) => onNodesChange(changes)}
                    onEdgesChange={(changes: EdgeChange[]) => onEdgesChange(changes)}
                    onConnect={onConnect}
                    snapGrid={[20, 20]}
                    onDragOver={onDragOver}
                    onDrop={onDrop}
                    snapToGrid={true}
                    onNodeDragStop={onNodeDragStop}
                    onSelectionDragStop={onSelectionDragStop}
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

function handleAddEntityToActiveView(visualModel: WritableVisualModel | null, modelId: string, entityId: string, position: XYPosition) {
    if (visualModel === null) {
        return;
    }
    visualModel.addVisualNode({
        model: modelId,
        representedEntity: entityId,
        content: [],
        position: { x: position.x, y: position.y, anchored: null },
        visualModels: [],
    });
}

function miniMapNodeColor(node: Node) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
    return tailwindColorToHex(node.data?.color);
}

function updateVisualEntityIfNecessary(node: Node, visualModel: WritableVisualModel | null) {
    if (visualModel === null) {
        return;
    }
    if (!isAtSamePositionAsVisualEntity(node, visualModel)) {
        visualModel.updateVisualEntity(node.id, { position: node.positionAbsolute });
    }
}

function isAtSamePositionAsVisualEntity(node: Node, visualModel: VisualModel): boolean {
    const visualNode = visualModel?.getVisualEntity(node.id) as VisualNode;
    const position = visualNode?.position;
    return node.positionAbsolute?.x === position?.x && node.positionAbsolute?.y === position?.y;
}

function propagateAggregatorChangesToVisualization(
    updated: AggregatedEntityWrapper[],
    removed: string[],
    //
    visualModel: WritableVisualModel,
    aggregatorView: SemanticModelAggregatorView,
    classesContext: UseClassesContextType,
    reactflow: ReactFlowInstance<object, object>,
    setNodes: Dispatch<SetStateAction<Node<any, string | undefined>[]>>,
    changedVisualModel: MutableRefObject<boolean>,
) {
    // We have updated the model since possible last change.
    changedVisualModel.current = false;

    const entities = aggregatorView.getEntities();

    let localRelationships = classesContext.relationships;
    let localAttributes = classesContext.relationships.filter(isSemanticModelAttribute);
    let localGeneralizations = classesContext.generalizations;
    let localProfiles = classesContext.profiles;
    let localAttributeProfiles = classesContext.profiles.filter(isSemanticModelAttributeUsage);

    // Remove entities.
    if (removed.length > 0) {
        // Update visualization.
        handleRemoveByAggregator(setNodes, visualModel, entities, classesContext.relationships, removed);
        // Update local state.
        const filterRemoved = (item: { id: string }) => !removed.includes(item.id);
        localAttributes = localAttributes.filter(filterRemoved);
        localAttributeProfiles = localAttributeProfiles.filter(filterRemoved);
        localGeneralizations = localGeneralizations.filter(filterRemoved);
        localRelationships = localRelationships.filter(filterRemoved);
        localProfiles = localProfiles.filter(filterRemoved);
    }

    // Update local state.
    // We use it when rendering content of the nodes.
    for (const updatedEntity of updated) {
        const entity = updatedEntity.aggregatedEntity;
        if (isSemanticModelAttribute(entity)) {
            localAttributes = localAttributes.filter((item) => item.id != entity.id).concat(entity);
        } else if (isSemanticModelAttributeUsage(entity)) {
            localAttributeProfiles = localAttributeProfiles.filter((item) => item.id != entity.id).concat(entity);
        } else if (isSemanticModelRelationship(entity)) {
            localRelationships = localRelationships.filter((item) => item.id != entity.id).concat(entity);
        } else if (isSemanticModelRelationshipUsage(entity)) {
            localProfiles = localProfiles.filter((item) => item.id != entity.id).concat(entity);
        } else if (isSemanticModelGeneralization(entity)) {
            localGeneralizations = localGeneralizations.filter((item) => item.id != entity.id).concat(entity);
        } else {
            // We do not care about other types here.
        }
    }

    // Update changed entities.
    for (const updatedEntity of updated) {
        handleChangeByAggregator(
            updatedEntity,
            reactflow, visualModel, entities,
            classesContext.sourceModelOfEntityMap,
            localAttributes, localAttributeProfiles, setNodes);
    }

}

function handleRemoveByAggregator(
    setNodes: Dispatch<SetStateAction<Node<any, string | undefined>[]>>,
    visualModel: WritableVisualModel,
    entities: Record<string, AggregatedEntityWrapper>,
    relationships: SemanticModelRelationship[],
    removed: string[],
) {
    // Collect nodes affected by removal of a relationship.
    const nodesAffectedByAttributeRemovals = new Set<string>();
    const affectedNodesReplacements: Node[] = [];
    for (const relationship of relationships) {
        if (!removed.includes(relationship.id)) {
            continue;
        }
        // Look for domain being class or class profile.
        const domainEntity = entities[temporaryDomainRangeHelper(relationship)?.domain.concept ?? ""]?.aggregatedEntity ?? null;
        if (isSemanticModelClass(domainEntity) || isSemanticModelClassUsage(domainEntity)) {
            const domainVisualEntity = visualModel.getVisualEntityForRepresented(domainEntity.id);
            if (domainVisualEntity !== null) {
                nodesAffectedByAttributeRemovals.add(domainVisualEntity.identifier);
                // TODO Create new version ?
                // affectedNodesReplacements.push(createReactflowNode())
            }
        }
    }

    // Remove visual entities representing the removed entities.
    const entitiesToRemove = new Set<string>();
    for (const remove of removed) {
        const visualEntity = visualModel.getVisualEntityForRepresented(remove);
        if (visualEntity === null) {
            continue;
        }
        entitiesToRemove.add(visualEntity.identifier);
    }

    // Changes nodes.
    setNodes(previous => previous.filter(item => !entitiesToRemove.has(item.id)));
}

function handleChangeByAggregator(
    change: AggregatedEntityWrapper,
    //
    reactflow: ReactFlowInstance<object, object>,
    visualModel: WritableVisualModel,
    entities: Record<string, AggregatedEntityWrapper>,
    sourceModelOfEntityMap: Map<string, string>,
    attributes: SemanticModelRelationship[],
    attributeProfiles: SemanticModelRelationshipUsage[],
    setNodes: Dispatch<SetStateAction<Node<any, string | undefined>[]>>,
) {
    if (change.aggregatedEntity === null) {
        // We have no information thus we can not update.
        return;
    }
    const entity = change.aggregatedEntity;
    const visualEntity = visualModel.getVisualEntityForRepresented(change.id);
    if (visualEntity === null) {
        // We have no visual representation of entity, so there is
        // nothing to update.
        return;
    }

    if (isSemanticModelClass(entity) || isSemanticModelClassUsage(entity)) {
        if (!isVisualNode(visualEntity)) {
            console.warn("Ignored update to entity as the visual entity is not a node.", { entity, visualEntity });
            return;
        }
        const node = reactflow.getNode(entity.id);
        if (node === undefined) {
            console.warn("No node returned by ReactFlow but there is a visual entity.", { entity, visualEntity });
        }
        // We just recreate the node, to propagate the changes.
        const nextNode = createReactflowNode(
            attributes, attributeProfiles, visualModel,
            entity, visualEntity);
        if (nextNode === null) {
            return;
        }
        // Replace old node with a new one.
        setNodes((prev) => prev.filter((node) => (node.data as ClassCustomNodeDataType).cls.id !== entity.id).concat(nextNode));
    } else if (isSemanticModelAttribute(entity) || isSemanticModelAttributeUsage(entity)) {
        // There has been change in an attribute. We need to
        // update visual entity with the attribute.
        if (bothEndsHaveAnIri(entity)) {
            // Both ends are IRI so it is not an attribute.
            console.warn("Ignore update of attribute (profile) as both ends are IRIs.", { entity });
            return;
        }
        // We need to the owner entity.
        const domainOfAttribute = temporaryDomainRangeHelper(entity)?.domain.concept;
        const ownerEntity = entities[domainOfAttribute ?? entity.ends[0]?.concept ?? ""]?.aggregatedEntity ?? null;
        if (isSemanticModelClass(ownerEntity) || isSemanticModelClassUsage(ownerEntity)) {
            // Owner is a class or class profile, so we can update the list of attributes.
            const ownerVisualEntity = visualModel.getVisualEntityForRepresented(ownerEntity.id);
            if (ownerVisualEntity === null || !isVisualNode(ownerVisualEntity)) {
                // There is no visual representation.
                return;
            }

            // We just recreate the node, to propagate the changes.
            const nextNode = createReactflowNode(
                attributes, attributeProfiles, visualModel,
                ownerEntity, ownerVisualEntity);
            if (nextNode === null) {
                return;
            }
            // Replace old node with a new one.
            setNodes((prev) => prev.filter((node) => (node.data as ClassCustomNodeDataType).cls.id !== entity.id).concat(nextNode));
        }
    }
}

/**
 * @returns Reactflow node or undefined.
 */
function createReactflowNode(
    attributes: SemanticModelRelationship[],
    attributeProfiles: SemanticModelRelationshipUsage[],
    visualModel: WritableVisualModel | null,
    entity: SemanticModelClass | SemanticModelClassUsage,
    visualNode: VisualNode | null,
): Node | null {
    if (visualModel === null) {
        return null;
    }

    // If we do not have visual entity try to get it from the visual model.
    if (visualNode === null) {
        const visualEntity = visualModel.getVisualEntityForRepresented(entity.id);
        if (visualEntity === null || !isVisualNode(visualEntity)) {
            return null;
        }
        visualNode = visualEntity;
    }

    const nodeAttributes = attributes
        .filter(isSemanticModelAttribute)
        .filter((attr) => getDomainAndRange(attr)?.domain.concept == entity.id);

    const nodeAttributeProfiles = attributeProfiles
        .filter(isSemanticModelAttributeUsage)
        .filter((attr) => temporaryDomainRangeHelper(attr)?.domain.concept == entity.id);

    const color = visualModel.getModelColor(visualNode.model) ?? DEFAULT_MODEL_COLOR;

    return semanticModelClassToReactFlowNode(
        entity.id, entity, visualNode.position,
        color, nodeAttributes, nodeAttributeProfiles
    );
}

function propagateVisualModelColorChangesToVisualization(
    changedModelIdentifier: string,
    setNodes: Dispatch<SetStateAction<Node<any, string | undefined>[]>>,
    setEdges: Dispatch<SetStateAction<Edge<any>[]>>,
    aggregatorView: SemanticModelAggregatorView,
    classesContext: UseClassesContextType,
    visualModel: WritableVisualModel,
) {
    // We need to re-render entities from the model.
    // We just collect them and use the other visual update method,
    // simulating change in the entities.
    const changes: {
        previous: VisualEntity | null;
        next: VisualEntity | null;
    }[] = [];

    // We need to update all entities from given model.
    for (const [identifier, entity] of visualModel.getVisualEntities()) {
        if (isVisualNode(entity)) {
            if (entity.model === changedModelIdentifier) {
                changes.push({previous: entity, next: entity});
            }
        } else if (isVisualRelationship(entity)) {
            if (entity.model === changedModelIdentifier) {
                changes.push({previous: entity, next: entity});
            }
        }
    }

    propagateVisualModelEntitiesChangesToVisualization(
        changes,
        setNodes, setEdges,
        aggregatorView, classesContext,
        visualModel);
}

/**
 * This method must not evaluate the changes as it is used by
 * other method to apply the changes.
 */
function propagateVisualModelEntitiesChangesToVisualization(
    changes: {
        previous: VisualEntity | null;
        next: VisualEntity | null;
    }[],
    //
    setNodes: Dispatch<SetStateAction<Node<any, string | undefined>[]>>,
    setEdges: Dispatch<SetStateAction<Edge<any>[]>>,
    aggregatorView: SemanticModelAggregatorView,
    classesContext: UseClassesContextType,
    visualModel: WritableVisualModel,
) {
    const attributes = classesContext.relationships.filter(isSemanticModelAttribute);
    const attributeProfiles = classesContext.profiles.filter(isSemanticModelAttributeUsage);

    const entities = aggregatorView.getEntities();

    // When updating we remove the old entity and add a new one.
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    const removed = new Set<string>();

    for (const { previous, next } of changes) {
        if (next !== null) {
            // Create or update
            if (isVisualNode(next)) {
                const entity = entities[next.representedEntity]?.aggregatedEntity ?? null;
                if (isSemanticModelClass(entity) || isSemanticModelClassUsage(entity)) {
                    const nextNode = createReactflowNode(
                        attributes, attributeProfiles, visualModel,
                        entity, next);
                    if (nextNode !== null) {
                        // This will do nothing when entity is new.
                        removed.add(next.representedEntity);
                        newNodes.push(nextNode);
                    } else {
                        console.warn("Ignored change of node visual entity as Reactflow node is null.", { next, entity });
                    }
                } else {
                    console.warn("Visual entity update ignored as represented entity is not of expected type (class, class profile).", { next, entity });
                }
            } else if (isVisualRelationship(next)) {
                const entity = entities[next.representedRelationship]?.aggregatedEntity ?? null;
                const model = classesContext.sourceModelOfEntityMap.get(next.representedRelationship) ?? null;
                const color = model === null ? undefined : visualModel?.getModelColor(model);

                const isRelationship =
                    isSemanticModelRelationship(entity) ||
                    isSemanticModelGeneralization(entity) ||
                    isSemanticModelRelationshipUsage(entity) ||
                    isSemanticModelClassUsage(entity);
                if (isRelationship) {
                    const nextEdge = createReactflowEdge(entity, color ?? undefined);
                    if (nextEdge !== null) {
                        removed.add(next.representedRelationship);
                        newEdges.push(nextEdge);
                    } else {
                        console.warn("Ignored change of relationship visual entity as Reactflow node is null.", { next, entity });
                    }
                } else {
                    console.warn("Visual entity update ignored as represented entity is null.", { next });
                }
            }
        } else if (previous !== null && next === null) {
            // Remove
            removed.add(previous.identifier);
        }
    }

    // Remove and add new.
    setNodes(previous => previous
        .filter(item => !removed.has(item.id))
        .concat(newNodes));
    setEdges(previous => previous
        .filter(item => !removed.has(item.id))
        .concat(newEdges));
}

/**
 * @returns Reactflow edge or undefined.
 */
function createReactflowEdge(
    entity: SemanticModelRelationship | SemanticModelGeneralization | SemanticModelRelationshipUsage | SemanticModelClassUsage,
    color: string | undefined,
) {
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
    return null;
}

/**
 * Set content of nodes and edges from the visual model.
 * Effectively erase any previous content.
 */
function resetReactflowFromVisualModel(
    setNodes: Dispatch<SetStateAction<Node<any, string | undefined>[]>>,
    setEdges: Dispatch<SetStateAction<Edge<any>[]>>,
    aggregatorView: SemanticModelAggregatorView,
    classesContext: UseClassesContextType,
    visualModel: WritableVisualModel,
) {
    const entities = aggregatorView.getEntities();
    const attributes = classesContext.relationships.filter(isSemanticModelAttribute);
    const attributeProfiles = classesContext.profiles.filter(isSemanticModelAttributeUsage);

    const nextNodes: Node[] = [];
    const nextEdges: Edge[] = [];
    const visualEntities = visualModel.getVisualEntities().values();
    for (const visualEntity of visualEntities) {
        if (isVisualNode(visualEntity)) {
            const entity = entities[visualEntity.representedEntity]?.aggregatedEntity ?? null;
            if (isSemanticModelClassUsage(entity) || isSemanticModelClass(entity)) {
                const nextNode = createReactflowNode(
                    attributes, attributeProfiles, visualModel,
                    entity, visualEntity);
                if (nextNode !== null) {
                    nextNodes.push(nextNode);
                }
            }
        } else if (isVisualRelationship(visualEntity)) {
            const entity = entities[visualEntity.representedRelationship]?.aggregatedEntity ?? null;
            const color = visualModel.getModelColor(visualEntity.model);

            const isRelationship =
                isSemanticModelRelationship(entity) ||
                isSemanticModelGeneralization(entity) ||
                isSemanticModelRelationshipUsage(entity) ||
                isSemanticModelClassUsage(entity);
            if (isRelationship) {
                const nextEdge = createReactflowEdge(entity, color ?? undefined);
                if (nextEdge !== null) {
                    nextEdges.push(nextEdge);
                }
            }
        } else {
            // For now we ignore all other.
        }
    }
    setNodes(nextNodes);
    setEdges(nextEdges);
}
