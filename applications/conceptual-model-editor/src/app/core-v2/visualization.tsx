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
import { useMemo, useCallback, useEffect } from "react";
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

export const Visualization = () => {
    const { classes, relationships, generalizations } = useClassesContext();
    const { hideOwlThing, getClassPosition, setClassPosition } = useVisualizationContext();

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const nodeTypes = useMemo(() => ({ classCustomNode: ClassCustomNode }), []);
    const edgeTypes = useMemo(() => ({ floating: SimpleFloatingEdge }), []);

    useEffect(() => {
        console.log("rerunning effect in visualization.tsx");
        setNodes([
            ...classes
                .filter((cls) => !hideOwlThing || !isOwlThing(cls.cls.id)) // FIXME: do this properly
                .map((cls, i) =>
                    semanticModelClassToReactFlowNode(
                        cls.cls,
                        getClassPosition(cls.cls.id),
                        colorForModel.get(cls.origin)
                    )
                ),
        ]);
        setEdges([
            ...relationships
                .filter((rel) => {
                    if (rel.ends.length !== 2) console.log(rel);
                    return rel.ends.length === 2;
                }) // FIXME: what to do with edges that don't have 2 ends
                .map((rel, i) => semanticModelRelationshipToReactFlowEdge(rel, i)),
            ...generalizations
                .filter((gen) => !hideOwlThing || !isOwlThing(gen.parent)) // FIXME: do this properly
                .map((gen, i) => semanticModelGeneralizationToReactFlowEdge(gen, i)),
        ]);
    }, [classes, relationships, hideOwlThing]);

    const handleNodeChanges = (changes: NodeChange[]) => {
        for (const change of changes) {
            if (change.type == "position") {
                setClassPosition(change.id, change.positionAbsolute); // FIXME: maybe optimize so that it doesn't update every pixel
            }
        }
    };

    return (
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
                    // console.log(changes);
                    onEdgesChange(changes);
                }}
                // onConnect={onConnect}
                snapGrid={[20, 20]}
                snapToGrid={true}
            >
                <Controls />
                <MiniMap
                    nodeColor={miniMapNodeColor}
                    style={{ borderStyle: "solid", borderColor: "#5438dc", borderWidth: "5px" }}
                />
                <Background gap={12} size={1} />
            </ReactFlow>
        </div>
    );
};

const miniMapNodeColor = (node: Node) => {
    return tailwindColorToHex.get(node.data?.tailwindColor) ?? "#e9e9e9";
};
