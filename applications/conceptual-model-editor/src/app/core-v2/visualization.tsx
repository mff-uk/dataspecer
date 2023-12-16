import ReactFlow, {
    Background,
    Connection,
    Controls,
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
import { useClassesContext } from "./context/classes-context";
import { isOwlThing, colorForModel, tailwindColorToHex } from "./util/utils";

import "reactflow/dist/style.css";
import { useVisualizationContext } from "./context/visualization-context";
import { useCreateConnectionDialog } from "./dialogs/create-connection-dialog";
import { useViewContext } from "./context/view-context";
import { useModelGraphContext } from "./context/graph-context";
import { UNKNOWN_MODEL_ID } from "./util/constants";
import { SemanticModelClass, isSemanticModelClass } from "@dataspecer/core-v2/semantic-model/concepts";
import { Entity } from "@dataspecer/core-v2/entity-model";

export const Visualization = () => {
    const { /* classes, */ relationships, generalizations, createConnection } = useClassesContext();
    const { classesAndPositions, updateClassPosition } = useViewContext();
    const { aggregatorView, visualModels } = useModelGraphContext();
    const { hideOwlThing, getClassPosition, setClassPosition } = useVisualizationContext();
    const { CreateConnectionDialog, isCreateConnectionDialogOpen, openCreateConnectionDialog } =
        useCreateConnectionDialog();

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

    useEffect(() => {
        console.log("running subscription effect");
        const callback = () => {
            console.log("a change subscriber defined in visualization:");
            console.log(aggregatorView.getEntities());

            const entities = aggregatorView.getEntities();

            const classesAsNodes = [...Object.keys(entities)]
                .filter((entityId) => isSemanticModelClass(entities[entityId]?.aggregatedEntity ?? null))
                .map((entityId) => {
                    const { id, aggregatedEntity, visualEntity } = entities[entityId]!;
                    const cls = aggregatedEntity as SemanticModelClass;
                    const pos = visualEntity?.position;
                    console.log(
                        "a change subscriber defined in visualization: tranfsorming nodes",
                        entities,
                        cls,
                        pos,
                        visualEntity
                    );
                    if (!cls || !pos) return;
                    return semanticModelClassToReactFlowNode(id, cls, pos, colorForModel.get(UNKNOWN_MODEL_ID));
                })
                .filter((nodeOrUndefined: Node | undefined): nodeOrUndefined is Node => !!nodeOrUndefined);
            console.log("a change subscriber defined in visualization: setting nodes to new ones", classesAsNodes);
            setNodes(classesAsNodes);
        };
        const callToUnsubscribe = aggregatorView.getActiveVisualModel()?.subscribeToChanges(callback);

        callback();
        return callToUnsubscribe;
    }, [aggregatorView]);

    useEffect(() => {
        console.log("visualization: rerunning effect in visualization.tsx");
        if (!classesAndPositions) return;
        console.log("visualization: after return statement");
        // const classesAsNodes = [...classesAndPositions.keys()]
        //     .map((classId) => {
        //         const cls = classes.get(classId);
        //         const pos = classesAndPositions.get(classId);
        //         if (!cls || !pos) return;
        //         return semanticModelClassToReactFlowNode(cls.cls, pos, colorForModel.get(cls.origin));
        //     })
        //     .filter((nodeOrUndefined: Node | undefined): nodeOrUndefined is Node => !!nodeOrUndefined);
        // const visualEntities = aggregatorView.getVisualEntities();
        // const classesAsNodes = [...Object.keys(visualEntities)]
        //     .map((visualEntityId) => {
        //         const cls = classes.get(visualEntities[visualEntityId]!.sourceEntityId);
        //         const pos = visualEntities[visualEntityId]?.position;
        //         if (!cls || !pos) return;
        //         return semanticModelClassToReactFlowNode(cls.cls, pos, colorForModel.get(cls.origin));
        //     })
        //     .filter((nodeOrUndefined: Node | undefined): nodeOrUndefined is Node => !!nodeOrUndefined);
        // console.log(classesAsNodes);
        // setNodes(classesAsNodes);
        // setEdges([
        //     ...relationships
        //         .filter((rel) => {
        //             if (rel.ends.length !== 2) console.log(rel);
        //             return rel.ends.length === 2;
        //         }) // FIXME: what to do with edges that don't have 2 ends
        //         .map((rel, i) => semanticModelRelationshipToReactFlowEdge(rel, i)),
        //     ...generalizations
        //         .filter((gen) => !hideOwlThing || !isOwlThing(gen.parent)) // FIXME: do this properly
        //         .map((gen, i) => semanticModelGeneralizationToReactFlowEdge(gen, i, undefined)),
        // ]);
    }, [classesAndPositions, relationships]);

    const handleNodeChanges = (changes: NodeChange[]) => {
        for (const change of changes) {
            if (change.type == "position") {
                setClassPosition(change.id, change.positionAbsolute); // FIXME: maybe optimize so that it doesn't update every pixel
                updateClassPosition(change.id, change.positionAbsolute); // FIXME: maybe optimize so that it doesn't update every pixel
                change.positionAbsolute &&
                    activeVisualModel?.updateEntity(change.id, { position: change.positionAbsolute });
            }
        }
    };

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
    return tailwindColorToHex.get(node.data?.tailwindColor) ?? "#e9e9e9";
};
