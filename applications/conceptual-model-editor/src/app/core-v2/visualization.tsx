import ReactFlow, {
    Background,
    Connection,
    Controls,
    Edge,
    EdgeChange,
    MiniMap,
    Node,
    NodeChange,
    addEdge,
    useEdgesState,
    useNodesState,
} from "reactflow";
import { useMemo, useCallback, useEffect, useState } from "react";
import { ClassCustomNode } from "./reactflow/class-custom-node";
import SimpleFloatingEdge from "./reactflow/simple-floating-edge";
import { useClassesContext } from "./context/classes-context";
import {
    isOwlThing,
    getRandomPosition,
    semanticModelClassToReactFlowNode,
    semanticModelGeneralizationToReactFlowEdge,
    semanticModelRelationshipToReactFlowEdge,
    colorForModel,
    tailwindColorToHex,
} from "./util/utils";

import "reactflow/dist/style.css";
import { useVisualizationContext } from "./context/visualization-context";
import { useCreateConnectionDialog } from "./dialogs/create-connection-dialog";
import { useViewContext } from "./context/view-context";

export const Visualization = () => {
    const { classes, relationships, generalizations, createConnection } = useClassesContext();
    const { classesAndPositions, updateClassPosition } = useViewContext();
    const { hideOwlThing, getClassPosition, setClassPosition } = useVisualizationContext();
    const { CreateConnectionDialog, isCreateConnectionDialogOpen, openCreateConnectionDialog } =
        useCreateConnectionDialog();

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const nodeTypes = useMemo(() => ({ classCustomNode: ClassCustomNode }), []);
    const edgeTypes = useMemo(() => ({ floating: SimpleFloatingEdge }), []);

    const onConnect = useCallback(
        (connection: Connection) => {
            console.log("gonna connect", connection);
            console.log("TODO: create connection between boxes with ds api");
            openCreateConnectionDialog(connection);
            return setEdges((eds) => addEdge(connection, eds)); // todo: tady pokracuj, at se zavre formular a podle toho se zapamatuje, jeslti je hrana nebo ne
        },
        [setEdges]
    );

    useEffect(() => {
        console.log("visualization: rerunning effect in visualization.tsx");
        if (!classesAndPositions) return;
        console.log("visualization: after return statement");
        const classesAsNodes = [...classesAndPositions.keys()]
            .map((classId) => {
                const cls = classes.get(classId);
                const pos = classesAndPositions.get(classId);
                if (!cls || !pos) return;
                return semanticModelClassToReactFlowNode(cls.cls, pos, colorForModel.get(cls.origin));
            })
            .filter((nodeOrUndefined: Node | undefined): nodeOrUndefined is Node => !!nodeOrUndefined);
        console.log(classesAsNodes);
        setNodes(classesAsNodes);
        //     ...classes
        //         .filter((cls) => !hideOwlThing || !isOwlThing(cls.cls.id)) // FIXME: do this properly
        //         .map((cls, i) =>
        //             semanticModelClassToReactFlowNode(
        //                 cls.cls,
        //                 getClassPosition(cls.cls.id),
        //                 colorForModel.get(cls.origin)
        //             )
        //         ),
        // ]);
        // setEdges([
        //     ...relationships
        //         .filter((rel) => {
        //             if (rel.ends.length !== 2) console.log(rel);
        //             return rel.ends.length === 2;
        //         }) // FIXME: what to do with edges that don't have 2 ends
        //         .map((rel, i) => semanticModelRelationshipToReactFlowEdge(rel, i)),
        //     ...generalizations
        //         .filter((gen) => !hideOwlThing || !isOwlThing(gen.parent)) // FIXME: do this properly
        //         .map((gen, i) => semanticModelGeneralizationToReactFlowEdge(gen, i)),
        // ]);
    }, [
        classesAndPositions,
        /* classes, relationships, hideOwlThing */
    ]);

    const handleNodeChanges = (changes: NodeChange[]) => {
        for (const change of changes) {
            if (change.type == "position") {
                setClassPosition(change.id, change.positionAbsolute); // FIXME: maybe optimize so that it doesn't update every pixel
                updateClassPosition(change.id, change.positionAbsolute); // FIXME: maybe optimize so that it doesn't update every pixel
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
