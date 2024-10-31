import { useMemo, useCallback, useEffect, useRef, type Dispatch, type SetStateAction, type MutableRefObject } from "react";
// import ReactFlow, {
//     type Connection,
//     type Edge,
//     type EdgeChange,
//     type Node,
//     type NodeChange,
//     Background,
//     Controls,
//     MiniMap,
//     Panel,
//     type ReactFlowInstance,
//     getRectOfNodes,
//     getTransformForBounds,
//     useEdgesState,
//     useNodesState,
//     useReactFlow,
// } from "reactflow";

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
import {
    type VisualNode,
    isVisualNode,
    isVisualRelationship,
    type VisualModel,
    type VisualEntity,
    type VisualRelationship,
    isVisualProfileRelationship,
    type VisualProfileRelationship,
} from "@dataspecer/core-v2/visual-model";
import {
    type SemanticModelAggregatorView,
    type AggregatedEntityWrapper,
} from "@dataspecer/core-v2/semantic-model/aggregator";


// import {
//     type ClassCustomNodeDataType,
//     ClassCustomNode,
//     semanticModelClassToReactFlowNode,
// } from "./reactflow/class-custom-node";
// import {
//     SimpleFloatingEdge,
//     semanticModelClassUsageToReactFlowEdge,
//     semanticModelGeneralizationToReactFlowEdge,
//     semanticModelRelationshipToReactFlowEdge,
// } from "./reactflow/simple-floating-edge";
import { tailwindColorToHex } from "./util/color-utils";
import { useModelGraphContext, type UseModelGraphContextType } from "./context/model-context";
import { useClassesContext, type UseClassesContextType } from "./context/classes-context";
import { bothEndsHaveAnIri, temporaryDomainRangeHelper } from "./util/relationship-utils";
import { toSvg } from "html-to-image";
import { useDownload } from "./features/export/download";
import { useActions } from "./action/actions-react-binding";
import { getDomainAndRange } from "./service/relationship-service";
import { Diagram, type Node, type Edge, type EntityItem, EdgeType } from "./diagram/";
import { type UseDiagramType } from "./diagram/diagram-hook";
import { logger } from "./application";
import { getDescriptionLanguageString, getFallbackDisplayName, getNameLanguageString, getUsageNoteLanguageString } from "./util/name-utils";
import { getLocalizedStringFromLanguageString } from "./util/language-utils";
import { getIri, getModelIri } from "./util/iri-utils";
import { findSourceModelOfEntity } from "./service/model-service";
import { type EntityModel } from "@dataspecer/core-v2";
import { cardinalityToString } from "./util/utils";
import { Options, useOptions } from "./application/options";

/**
 * Returns SVG for the current model.
 */
export let getSvgForCurrentView: () => Promise<{
    svg: string;
    forModelId: string;
} | null>;

// const NODE_TYPES = { classCustomNode: ClassCustomNode };

// const EDGE_TYPES = { floating: SimpleFloatingEdge };

const DEFAULT_MODEL_COLOR = "#ffffff";

export const Visualization = () => {
    const options = useOptions();
    const graph = useModelGraphContext();
    const aggregatorView = graph.aggregatorView;

    const actions = useActions();

    const { downloadImage } = useDownload();

    const classesContext = useClassesContext();

    const activeVisualModel = useMemo(() => aggregatorView.getActiveVisualModel(), [aggregatorView]);
    const changedVisualModel = useRef<boolean>(true);

    // const [nodes, setNodes, onNodesChange] = useNodesState([]);
    // const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    // const reactFlowInstance = useReactFlow<object, object>();

    // HANDLERS

    // const onDragOver = useCallback((event: React.DragEvent) => {
    //     event.preventDefault();
    //     event.dataTransfer.dropEffect = "move";
    // }, []);

    // const onDrop = useCallback((event: React.DragEvent) => {
    //     event.preventDefault();
    //
    //     const type = event.dataTransfer.getData("application/reactflow");
    //     const model = event.dataTransfer.getData("application/reactflow-model");
    //     const entityId = event.dataTransfer.getData("application/reactflow-entityId");
    //
    //     // check if the dropped element is valid
    //     if (typeof type === "undefined" || !type) {
    //         return;
    //     }
    //
    //     // reactFlowInstance.project was renamed to reactFlowInstance.screenToFlowPosition
    //     // and you don't need to subtract the reactFlowBounds.left/top anymore
    //     // details: https://reactflow.dev/whats-new/2023-11-10
    //     const position = reactFlowInstance?.screenToFlowPosition({
    //         x: event.clientX,
    //         y: event.clientY,
    //     });
    //
    //     actions.addNodeToVisualModel(model, entityId, position);
    // }, [reactFlowInstance, activeVisualModel]);

    // const onNodeDragStop = (_: React.MouseEvent, node: Node, nodes: Node[]) => {
    //     updateVisualEntityIfNecessary(node, activeVisualModel as WritableVisualModel);
    // };

    // const onSelectionDragStop = (_: React.MouseEvent, nodes: Node[]) => {
    //     for (const node of nodes) {
    //         updateVisualEntityIfNecessary(node, activeVisualModel as WritableVisualModel);
    //     }
    // };

    // EXPORT TO SVG : START

    // const getSvg = () => {
    //     // we calculate a transform for the nodes so that all nodes are visible
    //     // we then overwrite the transform of the `.react-flow__viewport` element
    //     // with the style option of the html-to-image library
    //     const imageWidth = 800;
    //     const imageHeight = 550;
    //     const nodesBounds = getRectOfNodes(nodes);
    //     const transform = getTransformForBounds(nodesBounds, imageWidth, imageHeight, 0.5, 2);
    //
    //     const flow__viewport = document.querySelector(".react-flow__viewport") as HTMLElement | null;
    //
    //     if (!flow__viewport) {
    //         return;
    //     }
    //
    //     return toSvg(flow__viewport, {
    //         backgroundColor: "#ffffff",
    //         width: imageWidth,
    //         height: imageHeight,
    //         style: {
    //             width: imageWidth.toString(),
    //             height: imageHeight.toString(),
    //             transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`,
    //         },
    //     });
    // };

    const exportCanvasToSvg = () => {
        // const svg = getSvg();
        // if (svg) {
        //     svg.then(downloadImage).catch(console.error);
        // }
    };

    // getSvgForCurrentView = () => getSvg()?.then((svg) => {
    //     return {
    //         svg: svg,
    //         forModelId: activeVisualModel?.getId() ?? "",
    //     };
    // }) ?? Promise.resolve(null);

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
            // propagateAggregatorChangesToVisualization(
            //     updated, removed, activeVisualModel as WritableVisualModel, aggregatorView,
            //     classesContext, reactFlowInstance, setNodes, changedVisualModel);
        });

        const unsubscribeCanvasCallback = aggregatorView.getActiveVisualModel()?.subscribeToChanges({
            modelColorDidChange(model) {
                if (activeVisualModel === null) {
                    return;
                }
                // We ignore model color changes here for now.
                console.log("[VISUALIZATION] Model color has been changed.", { model });
                // propagateVisualModelColorChangesToVisualization(
                //     model,
                //     setNodes, setEdges,
                //     aggregatorView, classesContext,
                //     activeVisualModel as WritableVisualModel);
            },
            visualEntitiesDidChange(changes) {
                if (activeVisualModel === null) {
                    return;
                }
                console.log("[VISUALIZATION] Visual entities has been changed.", { changes });
                onChangeVisualEntities(
                    options, activeVisualModel, actions.diagram, aggregatorView, classesContext, graph,
                    changes,
                );
            },
        });

        return () => {
            unsubscribeSemanticAggregatorCallback?.();
            unsubscribeCanvasCallback?.();
        };
         
    }, [options, activeVisualModel, actions, aggregatorView, classesContext, graph]);

    // Update canvas content on view change.
    useEffect(() => {
        console.log("[VISUALIZATION] Active visual model has changed.", activeVisualModel);
        onChangeVisualModel(options, activeVisualModel, actions.diagram, aggregatorView, classesContext, graph);
    }, [options, activeVisualModel, actions, aggregatorView, classesContext, graph]);

    return (
        <>
            <div className="h-[80vh] w-full md:h-full">
                {actions.diagram === null ? null : <Diagram diagram={actions.diagram} />}
                {/* <ReactFlow
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
                </ReactFlow> */}
            </div>
        </>
    );
};

// function miniMapNodeColor(node: Node) {
//     // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
//     return tailwindColorToHex(node.data?.color);
// }

// function updateVisualEntityIfNecessary(node: Node, visualModel: WritableVisualModel | null) {
//     if (visualModel === null) {
//         return;
//     }
//     if (!isAtSamePositionAsVisualEntity(node, visualModel)) {
//         visualModel.updateVisualEntity(node.id, { position: node.positionAbsolute });
//     }
// }

// function isAtSamePositionAsVisualEntity(node: Node, visualModel: VisualModel): boolean {
//     const visualNode = visualModel?.getVisualEntity(node.id) as VisualNode;
//     const position = visualNode?.position;
//     return node.positionAbsolute?.x === position?.x && node.positionAbsolute?.y === position?.y;
// }

// function propagateAggregatorChangesToVisualization(
//     updated: AggregatedEntityWrapper[],
//     removed: string[],
//     //
//     visualModel: WritableVisualModel,
//     aggregatorView: SemanticModelAggregatorView,
//     classesContext: UseClassesContextType,
//     reactflow: ReactFlowInstance<object, object>,
//     setNodes: Dispatch<SetStateAction<Node<any, string | undefined>[]>>,
//     changedVisualModel: MutableRefObject<boolean>,
// ) {
//     // We have updated the model since possible last change.
//     changedVisualModel.current = false;
//
//     const entities = aggregatorView.getEntities();
//
//     let localRelationships = classesContext.relationships;
//     let localAttributes = classesContext.relationships.filter(isSemanticModelAttribute);
//     let localGeneralizations = classesContext.generalizations;
//     let localProfiles = classesContext.profiles;
//     let localAttributeProfiles = classesContext.profiles.filter(isSemanticModelAttributeUsage);
//
//     // Remove entities.
//     if (removed.length > 0) {
//         // Update visualization.
//         handleRemoveByAggregator(setNodes, visualModel, entities, classesContext.relationships, removed);
//         // Update local state.
//         const filterRemoved = (item: { id: string }) => !removed.includes(item.id);
//         localAttributes = localAttributes.filter(filterRemoved);
//         localAttributeProfiles = localAttributeProfiles.filter(filterRemoved);
//         localGeneralizations = localGeneralizations.filter(filterRemoved);
//         localRelationships = localRelationships.filter(filterRemoved);
//         localProfiles = localProfiles.filter(filterRemoved);
//     }
//
//     // Update local state.
//     // We use it when rendering content of the nodes.
//     for (const updatedEntity of updated) {
//         const entity = updatedEntity.aggregatedEntity;
//         if (isSemanticModelAttribute(entity)) {
//             localAttributes = localAttributes.filter((item) => item.id != entity.id).concat(entity);
//         } else if (isSemanticModelAttributeUsage(entity)) {
//             localAttributeProfiles = localAttributeProfiles.filter((item) => item.id != entity.id).concat(entity);
//         } else if (isSemanticModelRelationship(entity)) {
//             localRelationships = localRelationships.filter((item) => item.id != entity.id).concat(entity);
//         } else if (isSemanticModelRelationshipUsage(entity)) {
//             localProfiles = localProfiles.filter((item) => item.id != entity.id).concat(entity);
//         } else if (isSemanticModelGeneralization(entity)) {
//             localGeneralizations = localGeneralizations.filter((item) => item.id != entity.id).concat(entity);
//         } else {
//             // We do not care about other types here.
//         }
//     }
//
//     // Update changed entities.
//     for (const updatedEntity of updated) {
//         handleChangeByAggregator(
//             updatedEntity,
//             reactflow, visualModel, entities,
//             classesContext.sourceModelOfEntityMap,
//             localAttributes, localAttributeProfiles, setNodes);
//     }
//
// }

// function handleRemoveByAggregator(
//     setNodes: Dispatch<SetStateAction<Node<any, string | undefined>[]>>,
//     visualModel: WritableVisualModel,
//     entities: Record<string, AggregatedEntityWrapper>,
//     relationships: SemanticModelRelationship[],
//     removed: string[],
// ) {
//     // Collect nodes affected by removal of a relationship.
//     const nodesAffectedByAttributeRemovals = new Set<string>();
//     const affectedNodesReplacements: Node[] = [];
//     for (const relationship of relationships) {
//         if (!removed.includes(relationship.id)) {
//             continue;
//         }
//         // Look for domain being class or class profile.
//         const domainEntity = entities[temporaryDomainRangeHelper(relationship)?.domain.concept ?? ""]?.aggregatedEntity ?? null;
//         if (isSemanticModelClass(domainEntity) || isSemanticModelClassUsage(domainEntity)) {
//             const domainVisualEntity = visualModel.getVisualEntityForRepresented(domainEntity.id);
//             if (domainVisualEntity !== null) {
//                 nodesAffectedByAttributeRemovals.add(domainVisualEntity.identifier);
//                 // TODO Create new version ?
//                 // affectedNodesReplacements.push(createReactflowNode())
//             }
//         }
//     }
//
//     // Remove visual entities representing the removed entities.
//     const entitiesToRemove = new Set<string>();
//     for (const remove of removed) {
//         const visualEntity = visualModel.getVisualEntityForRepresented(remove);
//         if (visualEntity === null) {
//             continue;
//         }
//         entitiesToRemove.add(visualEntity.identifier);
//     }
//
//     // Changes nodes.
//     setNodes(previous => previous.filter(item => !entitiesToRemove.has(item.id)));
// }

// function handleChangeByAggregator(
//     change: AggregatedEntityWrapper,
//     //
//     reactflow: ReactFlowInstance<object, object>,
//     visualModel: WritableVisualModel,
//     entities: Record<string, AggregatedEntityWrapper>,
//     sourceModelOfEntityMap: Map<string, string>,
//     attributes: SemanticModelRelationship[],
//     attributeProfiles: SemanticModelRelationshipUsage[],
//     setNodes: Dispatch<SetStateAction<Node<any, string | undefined>[]>>,
// ) {
//     if (change.aggregatedEntity === null) {
//         // We have no information thus we can not update.
//         return;
//     }
//     const entity = change.aggregatedEntity;
//     const visualEntity = visualModel.getVisualEntityForRepresented(change.id);
//     if (visualEntity === null) {
//         // We have no visual representation of entity, so there is
//         // nothing to update.
//         return;
//     }

//     if (isSemanticModelClass(entity) || isSemanticModelClassUsage(entity)) {
//         if (!isVisualNode(visualEntity)) {
//             console.warn("Ignored update to entity as the visual entity is not a node.", { entity, visualEntity });
//             return;
//         }
//         const node = reactflow.getNode(entity.id);
//         if (node === undefined) {
//             console.warn("No node returned by ReactFlow but there is a visual entity.", { entity, visualEntity });
//         }
//         // We just recreate the node, to propagate the changes.
//         const nextNode = createReactflowNode(
//             attributes, attributeProfiles, visualModel,
//             entity, visualEntity);
//         if (nextNode === null) {
//             return;
//         }
//         // Replace old node with a new one.
//         setNodes((prev) => prev.filter((node) => (node.data as ClassCustomNodeDataType).cls.id !== entity.id).concat(nextNode));
//     } else if (isSemanticModelAttribute(entity) || isSemanticModelAttributeUsage(entity)) {
//         // There has been change in an attribute. We need to
//         // update visual entity with the attribute.
//         if (bothEndsHaveAnIri(entity)) {
//             // Both ends are IRI so it is not an attribute.
//             console.warn("Ignore update of attribute (profile) as both ends are IRIs.", { entity });
//             return;
//         }
//         // We need to the owner entity.
//         const domainOfAttribute = temporaryDomainRangeHelper(entity)?.domain.concept;
//         const ownerEntity = entities[domainOfAttribute ?? entity.ends[0]?.concept ?? ""]?.aggregatedEntity ?? null;
//         if (isSemanticModelClass(ownerEntity) || isSemanticModelClassUsage(ownerEntity)) {
//             // Owner is a class or class profile, so we can update the list of attributes.
//             const ownerVisualEntity = visualModel.getVisualEntityForRepresented(ownerEntity.id);
//             if (ownerVisualEntity === null || !isVisualNode(ownerVisualEntity)) {
//                 // There is no visual representation.
//                 return;
//             }
//
//             // We just recreate the node, to propagate the changes.
//             const nextNode = createReactflowNode(
//                 attributes, attributeProfiles, visualModel,
//                 ownerEntity, ownerVisualEntity);
//             if (nextNode === null) {
//                 return;
//             }
//             // Replace old node with a new one.
//             setNodes((prev) => prev.filter((node) => (node.data as ClassCustomNodeDataType).cls.id !== entity.id).concat(nextNode));
//         }
//     }
// }

// function propagateVisualModelColorChangesToVisualization(
//     changedModelIdentifier: string,
//     setNodes: Dispatch<SetStateAction<Node<any, string | undefined>[]>>,
//     setEdges: Dispatch<SetStateAction<Edge<any>[]>>,
//     aggregatorView: SemanticModelAggregatorView,
//     classesContext: UseClassesContextType,
//     visualModel: WritableVisualModel,
// ) {
//     // We need to re-render entities from the model.
//     // We just collect them and use the other visual update method,
//     // simulating change in the entities.
//     const changes: {
//         previous: VisualEntity | null;
//         next: VisualEntity | null;
//     }[] = [];
//
//     // We need to update all entities from given model.
//     for (const [identifier, entity] of visualModel.getVisualEntities()) {
//         if (isVisualNode(entity)) {
//             if (entity.model === changedModelIdentifier) {
//                 changes.push({ previous: entity, next: entity });
//             }
//         } else if (isVisualRelationship(entity)) {
//             if (entity.model === changedModelIdentifier) {
//                 changes.push({ previous: entity, next: entity });
//             }
//         }
//     }
//
//     propagateVisualModelEntitiesChangesToVisualization(
//         changes,
//         setNodes, setEdges,
//         aggregatorView, classesContext,
//         visualModel);
// }

// /**
//  * This method must not evaluate the changes as it is used by
//  * other method to apply the changes.
//  */
// function propagateVisualModelEntitiesChangesToVisualization(
//     changes: {
//         previous: VisualEntity | null;
//         next: VisualEntity | null;
//     }[],
//     //
//     setNodes: Dispatch<SetStateAction<Node<any, string | undefined>[]>>,
//     setEdges: Dispatch<SetStateAction<Edge<any>[]>>,
//     aggregatorView: SemanticModelAggregatorView,
//     classesContext: UseClassesContextType,
//     visualModel: WritableVisualModel,
// ) {
//     const attributes = classesContext.relationships.filter(isSemanticModelAttribute);
//     const attributeProfiles = classesContext.profiles.filter(isSemanticModelAttributeUsage);
//
//     const entities = aggregatorView.getEntities();
//
//     // When updating we remove the old entity and add a new one.
//     const newNodes: Node[] = [];
//     const newEdges: Edge[] = [];
//     const removed = new Set<string>();
//
//     for (const { previous, next } of changes) {
//         if (next !== null) {
//             // Create or update
//             if (isVisualNode(next)) {
//                 const entity = entities[next.representedEntity]?.aggregatedEntity ?? null;
//                 if (isSemanticModelClass(entity) || isSemanticModelClassUsage(entity)) {
//                     const nextNode = createReactflowNode(
//                         attributes, attributeProfiles, visualModel,
//                         entity, next);
//                     if (nextNode !== null) {
//                         // This will do nothing when entity is new.
//                         removed.add(next.representedEntity);
//                         newNodes.push(nextNode);
//                     } else {
//                         console.warn("Ignored change of node visual entity as Reactflow node is null.", { next, entity });
//                     }
//                 } else {
//                     console.warn("Visual entity update ignored as represented entity is not of expected type (class, class profile).", { next, entity });
//                 }
//             } else if (isVisualRelationship(next)) {
//                 const entity = entities[next.representedRelationship]?.aggregatedEntity ?? null;
//                 const model = classesContext.sourceModelOfEntityMap.get(next.representedRelationship) ?? null;
//                 const color = model === null ? undefined : visualModel?.getModelColor(model);
//
//                 const isRelationship =
//                     isSemanticModelRelationship(entity) ||
//                     isSemanticModelGeneralization(entity) ||
//                     isSemanticModelRelationshipUsage(entity) ||
//                     isSemanticModelClassUsage(entity);
//                 if (isRelationship) {
//                     const nextEdge = createReactflowEdge(visualModel, next.identifier, entity, color ?? undefined);
//                     if (nextEdge !== null) {
//                         removed.add(next.representedRelationship);
//                         newEdges.push(nextEdge);
//                     } else {
//                         console.warn("Ignored change of relationship visual entity as Reactflow node is null.", { next, entity });
//                     }
//                 } else {
//                     console.warn("Visual entity update ignored as represented entity is null.", { next });
//                 }
//             }
//         } else if (previous !== null && next === null) {
//             // Remove
//             removed.add(previous.identifier);
//         }
//     }
//     console.log("propagateVisualModelEntitiesChangesToVisualization", { edges: newEdges, nodes: newNodes, removed });
//     // Remove and add new.
//     setNodes(previous => previous
//         .filter(item => !removed.has(item.id))
//         .concat(newNodes));
//     setEdges(previous => previous
//         .filter(item => !removed.has(item.id))
//         .concat(newEdges));
// }

/**
 * Set content of nodes and edges from the visual model.
 * Effectively erase any previous content.
 *
 * TODO We call setContent which is async, we should return a promise and wait.
 */
function onChangeVisualModel(
    options: Options,
    visualModel: VisualModel | null,
    diagram: UseDiagramType | null,
    aggregatorView: SemanticModelAggregatorView,
    classesContext: UseClassesContextType,
    graphContext: UseModelGraphContextType,
) {
    if (diagram === null || !diagram.areActionsReady) {
        logger.warn("Visual model change is ignored as the diagram is not ready!");
        return;
    }
    if (visualModel === null) {
        // We just set content to nothing and return.
        void diagram.actions().setContent([], []);
        return;
    }

    const models = graphContext.models;
    const entities = aggregatorView.getEntities();
    const attributes = classesContext.relationships.filter(isSemanticModelAttribute);
    const attributeProfiles = classesContext.profiles.filter(isSemanticModelAttributeUsage);

    const profilingSources = [...classesContext.classes, ...classesContext.relationships, ...classesContext.profiles];

    const nextNodes: Node[] = [];
    const nextEdges: Edge[] = [];

    const visualEntities = visualModel.getVisualEntities().values();
    for (const visualEntity of visualEntities) {
        if (isVisualNode(visualEntity)) {
            const entity = entities[visualEntity.representedEntity]?.aggregatedEntity ?? null;
            if (isSemanticModelClassUsage(entity) || isSemanticModelClass(entity)) {
                const model = findSourceModelOfEntity(entity.id, models);
                if (model === null) {
                    console.error("Ignored entity for missing model.", { entity });
                    continue;
                }
                const node = createDiagramNode(
                    options, visualModel,
                    attributes, attributeProfiles, profilingSources,
                    visualEntity, entity, model);
                nextNodes.push(node);
            }
        } else if (isVisualRelationship(visualEntity)) {
            const entity = entities[visualEntity.representedRelationship]?.aggregatedEntity ?? null;
            const isRelationship =
                isSemanticModelRelationship(entity) ||
                isSemanticModelGeneralization(entity);
            if (isRelationship) {
                const model = findSourceModelOfEntity(entity.id, models);
                if (model === null) {
                    console.error("Ignored entity for missing model.", { entity });
                    continue;
                }
                const edge = createDiagramEdge(
                    options, visualModel, profilingSources, visualEntity, entity);
                if (edge !== null) {
                    nextEdges.push(edge);
                }
            }
        } else if (isVisualProfileRelationship(visualEntity)) {
            const entity = entities[visualEntity.entity]?.aggregatedEntity ?? null;
            if (!isSemanticModelClassUsage(entity)) {
                console.error("Ignored profile relation as entity is not a profile.", { entity });
                continue;
            }
            const model = findSourceModelOfEntity(entity.id, models);
            if (model === null) {
                console.error("Ignored entity for missing model.", { entity });
                continue;
            }
            const profileOf = visualModel.getVisualEntityForRepresented(entity.usageOf);
            if (profileOf === null) {
                console.error("Missing profile for profile relation.", { entity });
                continue;
            }
            const edge = createDiagramEdgeForClassProfile(visualModel, visualEntity, entity);
            if (edge !== null) {
                nextEdges.push(edge);
            }
        }
        // For now we ignore all other.
    }

    void diagram.actions().setContent(nextNodes, nextEdges);
}

function createDiagramNode(
    options: Options,
    visualModel: VisualModel,
    attributes: SemanticModelRelationship[],
    attributesProfiles: SemanticModelRelationshipUsage[],
    profilingSources: (SemanticModelRelationship | SemanticModelClassUsage | SemanticModelRelationshipUsage | SemanticModelClass)[],
    visualNode: VisualNode,
    entity: SemanticModelClass | SemanticModelClassUsage,
    model: EntityModel,
): Node {
    const language = options.language;

    const nodeAttributes = attributes
        .filter(isSemanticModelAttribute)
        .filter((attr) => getDomainAndRange(attr).domain?.concept == entity.id);

    const nodeAttributeProfiles = attributesProfiles
        .filter(isSemanticModelAttributeUsage)
        .filter((attr) => temporaryDomainRangeHelper(attr)?.domain.concept == entity.id);

    const items: EntityItem[] = [];
    for (const attribute of nodeAttributes) {
        items.push({
            identifier: attribute.id,
            label: getEntityLabel(language, attribute),
            profileOf: null,
        });
    }

    for (const attributeProfile of nodeAttributeProfiles) {
        const profileOf =
            (isSemanticModelClassUsage(attributeProfile) || isSemanticModelRelationshipUsage(attributeProfile)
                ? profilingSources.find((e) => e.id == attributeProfile.usageOf)
                : null
            ) ?? null;

        items.push({
            identifier: attributeProfile.id,
            label: getEntityLabel(language, attributeProfile),
            profileOf: profileOf === null ? null : {
                label: getEntityLabel(language, profileOf),
                usageNote: getUsageNote(language, attributeProfile),
            },
        });
    }

    const profileOf =
        (isSemanticModelClassUsage(entity) || isSemanticModelRelationshipUsage(entity)
            ? profilingSources.find((e) => e.id == entity.usageOf)
            : null
        ) ?? null;

    return {
        identifier: visualNode.identifier,
        externalIdentifier: entity.id,
        label: getEntityLabel(language, entity),
        iri: getIri(entity, getModelIri(model)),
        color: visualModel.getModelColor(visualNode.model) ?? DEFAULT_MODEL_COLOR,
        description: getEntityDescription(language, entity),
        group: null,
        position: {
            x: visualNode.position.x,
            y: visualNode.position.y,
        },
        profileOf: profileOf === null ? null : {
            label: getEntityLabel(language, profileOf),
            usageNote: getUsageNote(language, entity),
        },
        items: items,
    };
}

function getEntityLabel(
    language: string,
    entity: SemanticModelClass | SemanticModelRelationship | SemanticModelClassUsage | SemanticModelRelationshipUsage | SemanticModelGeneralization
) {
    return getLocalizedStringFromLanguageString(getNameLanguageString(entity), language)
        ?? getFallbackDisplayName(entity) ?? "";
}

function getEntityDescription(
    language: string,
    entity: SemanticModelClass | SemanticModelRelationship | SemanticModelClassUsage | SemanticModelRelationshipUsage | SemanticModelGeneralization) {
    return getLocalizedStringFromLanguageString(getDescriptionLanguageString(entity), language);
}

function getUsageNote(
    language: string,
    entity: SemanticModelClass | SemanticModelRelationship | SemanticModelClassUsage | SemanticModelRelationshipUsage | SemanticModelGeneralization) {
    return getLocalizedStringFromLanguageString(getUsageNoteLanguageString(entity), language);
}

function createDiagramEdge(
    options: Options,
    visualModel: VisualModel,
    profilingSources: (SemanticModelRelationship | SemanticModelClassUsage | SemanticModelRelationshipUsage | SemanticModelClass)[],
    visualNode: VisualRelationship,
    entity: SemanticModelRelationship | SemanticModelGeneralization,
): Edge | null {
    const identifier = entity.id;
    if (isSemanticModelRelationship(entity)) {
        return createDiagramEdgeForRelationship(
            options, visualModel, profilingSources, visualNode, entity);
    } else if (isSemanticModelGeneralization(entity)) {
        return createDiagramEdgeForGeneralization(
            visualModel, visualNode, entity);
    }
    throw Error(`Unknown entity type ${identifier}.`);
}

function createDiagramEdgeForRelationship(
    options: Options,
    visualModel: VisualModel,
    profilingSources: (SemanticModelRelationship | SemanticModelClassUsage | SemanticModelRelationshipUsage | SemanticModelClass)[],
    visualNode: VisualRelationship,
    entity: SemanticModelRelationship,
): Edge {
    const language = options.language;

    const profileOf =
        (isSemanticModelRelationshipUsage(entity)
            ? profilingSources.find((e) => e.id == entity.usageOf)
            : null
        ) ?? null;

    const { domain, range } = getDomainAndRange(entity);

    return {
        type: EdgeType.Association,
        identifier: visualNode.identifier,
        externalIdentifier: entity.id,
        label: getEntityLabel(language, entity),
        source: visualNode.visualSource,
        cardinalitySource: cardinalityToString(domain?.cardinality),
        target: visualNode.visualTarget,
        cardinalityTarget: cardinalityToString(range?.cardinality),
        color: visualModel.getModelColor(visualNode.model) ?? DEFAULT_MODEL_COLOR,
        waypoints: [],
        profileOf: profileOf === null ? null : {
            label: getEntityLabel(language, profileOf),
            usageNote: getUsageNote(language, entity),
        },
    };
}

function createDiagramEdgeForGeneralization(
    visualModel: VisualModel,
    visualNode: VisualRelationship,
    entity: SemanticModelGeneralization,
): Edge {

    return {
        type: EdgeType.Generalization,
        identifier: visualNode.identifier,
        externalIdentifier: entity.id,
        label: null,
        source: visualNode.visualSource,
        cardinalitySource: null,
        target: visualNode.visualTarget,
        cardinalityTarget: null,
        color: visualModel.getModelColor(visualNode.model) ?? DEFAULT_MODEL_COLOR,
        waypoints: [],
        profileOf: null,
    };
}

function createDiagramEdgeForClassProfile(
    visualModel: VisualModel,
    visualNode: VisualProfileRelationship,
    entity: SemanticModelClassUsage,
): Edge | null {

    return {
        type: EdgeType.ClassProfile,
        identifier: visualNode.identifier,
        externalIdentifier: entity.id,
        label: "<<profile>>",
        source: visualNode.visualSource,
        cardinalitySource: null,
        target: visualNode.visualTarget,
        cardinalityTarget: null,
        color: visualModel.getModelColor(visualNode.model) ?? DEFAULT_MODEL_COLOR,
        waypoints: [],
        profileOf: null,
    };
}

function onChangeVisualEntities(
    options: Options,
    visualModel: VisualModel | null,
    diagram: UseDiagramType | null,
    aggregatorView: SemanticModelAggregatorView,
    classesContext: UseClassesContextType,
    graphContext: UseModelGraphContextType,
    changes: {
        previous: VisualEntity | null;
        next: VisualEntity | null;
    }[]
) {
    if (diagram === null || !diagram.areActionsReady) {
        logger.warn("Visual entities change is ignored as the diagram is not ready!");
        return;
    }
    if (visualModel === null) {
        // We just set content to nothing and return.
        void diagram.actions().setContent([], []);
        return;
    }

    const models = graphContext.models;
    const entities = aggregatorView.getEntities();
    const attributes = classesContext.relationships.filter(isSemanticModelAttribute);
    const attributeProfiles = classesContext.profiles.filter(isSemanticModelAttributeUsage);

    const profilingSources = [...classesContext.classes, ...classesContext.relationships, ...classesContext.profiles];

    const actions = diagram.actions();

    for (const { previous, next } of changes) {
        if (next !== null) {
            // New or changed entity entity.
            if (isVisualNode(next)) {
                const entity = entities[next.representedEntity]?.rawEntity ?? null;

                if (!isSemanticModelClass(entity) && !isSemanticModelClassUsage(entity)) {
                    console.error("In visual update semantic entity is not class or class usage.", { entity, visual: next });
                    continue;
                }

                const model = findSourceModelOfEntity(entity.id, models);
                if (model === null) {
                    console.error("Ignored entity for missing model.", { entity });
                    continue;
                }

                const node = createDiagramNode(
                    options, visualModel,
                    attributes, attributeProfiles, profilingSources,
                    next, entity, model);

                if (previous === null) {
                    // Create new entity.
                    actions.addNodes([node]);
                } else {
                    // Change of existing.
                    actions.updateNodes([node]);
                }

            } else if (isVisualRelationship(next)) {
                const entity = entities[next.representedRelationship]?.rawEntity ?? null;

                const isRelationship =
                    isSemanticModelRelationship(entity) ||
                    isSemanticModelGeneralization(entity);
                if (!isRelationship) {
                    console.error("In visual update semantic entity is not a relationship.", { entity, visual: next });
                    continue;
                }

                const model = findSourceModelOfEntity(entity.id, models);
                if (model === null) {
                    console.error("Ignored entity for missing model.", { entity });
                    continue;
                }

                const edge = createDiagramEdge(options, visualModel, profilingSources, next, entity);

                if (edge === null) {
                    console.error("In visual update created edge is null.", { entity, visual: next });
                    continue;
                }

                if (previous === null) {
                    // Create new entity.
                    actions.addEdges([edge]);
                } else {
                    // Change of existing.
                    actions.updateEdges([edge]);
                }

            } else if (isVisualProfileRelationship(next)) {
                const entity = entities[next.entity]?.rawEntity ?? null;

                if (!isSemanticModelClassUsage(entity)) {
                    console.error("In visual update semantic entity is not a profile.", { entity, visual: next });
                    continue;
                }

                const profileOf = visualModel.getVisualEntityForRepresented(entity.usageOf);
                if (profileOf === null) {
                    console.error("Missing profile for profile relation.", { entity });
                    continue;
                }

                const edge = createDiagramEdgeForClassProfile(visualModel, next, entity);

                if (edge === null) {
                    console.error("In visual update created edge is null.", { entity, visual: next });
                    continue;
                }

                if (previous === null) {
                    // Create new entity.
                    actions.addEdges([edge]);
                } else {
                    // Change of existing.
                    actions.updateEdges([edge]);
                }

            } else {
                // We ignore other properties.
            }
        }
        // ...
        if (previous !== null && next === null) {
            // Entity removed
            if (isVisualNode(previous)) {
                actions.removeNodes([previous.identifier]);
            } else if (isVisualRelationship(previous) || isVisualProfileRelationship(previous)) {
                actions.removeEdges([previous.identifier]);
            } else {
                // We ignore other properties.
            }
        }
    }
}
