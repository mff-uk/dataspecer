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
            openCreateConnectionDialog(connection);
            // TODO: tady by se tohle vubec nemelo volat to `setEdges`, to by se melo prebrat z modelu
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
        setEdges([
            ...relationships
                .filter((rel) => {
                    if (rel.ends.length !== 2) console.log(rel);
                    return rel.ends.length === 2;
                }) // FIXME: what to do with edges that don't have 2 ends
                .map((rel, i) => semanticModelRelationshipToReactFlowEdge(rel, i)),
            ...generalizations
                .filter((gen) => !hideOwlThing || !isOwlThing(gen.parent)) // FIXME: do this properly
                .map((gen, i) => semanticModelGeneralizationToReactFlowEdge(gen, i, undefined)),
        ]);
    }, [classesAndPositions, relationships]);

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
