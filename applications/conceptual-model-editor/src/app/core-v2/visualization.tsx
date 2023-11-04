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
import { useClassesContext } from "./classes-context";
import {
    isOwlThing,
    getRandomPosition,
    semanticModelClassToReactFlowNode,
    semanticModelGeneralizationToReactFlowEdge,
    semanticModelRelationshipToReactFlowEdge,
    colorForModel,
    tailwindColorToHex,
} from "./utils";

import "reactflow/dist/style.css";
import { useVisualizationContext } from "./visualization-context";

export const Visualization = () => {
    const { classes, relationships, generalizations } = useClassesContext();
    const { hideOwlThing } = useVisualizationContext();

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const nodeTypes = useMemo(() => ({ classCustomNode: ClassCustomNode }), []);
    const edgeTypes = useMemo(() => ({ floating: SimpleFloatingEdge }), []);

    useEffect(() => {
        console.log(relationships);
        setNodes((nodes) => {
            // FIXME: cele tohle vypada otresne
            const presentNodeIds = new Set(nodes.map((n) => n.id));
            return [
                ...classes
                    .filter((cls) => !hideOwlThing || !isOwlThing(cls.cls.id)) // FIXME: do this properly
                    .filter((cls) => !presentNodeIds.has(cls.cls.id))
                    .map((cls, i) =>
                        semanticModelClassToReactFlowNode(cls.cls, getRandomPosition(), colorForModel.get(cls.origin))
                    ),
                ...nodes.filter((node) => !hideOwlThing || !isOwlThing(node.id)), // FIXME: do this properly,
            ];
        });
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

    return (
        <div className="h-full w-full">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                onNodesChange={(changes: NodeChange[]) => {
                    console.log(changes);
                    onNodesChange(changes);
                }}
                onEdgesChange={(changes: EdgeChange[]) => {
                    console.log(changes);
                    onEdgesChange(changes);
                }}
                // onConnect={onConnect}
            >
                <Controls />
                <MiniMap
                    nodeColor={miniMapNodeColor}
                    style={{ borderStyle: "solid", borderColor: "darkblue", borderWidth: "5px" }}
                />
                <Background gap={12} size={1} />
            </ReactFlow>
        </div>
    );
};

const miniMapNodeColor = (node: Node) => {
    return tailwindColorToHex.get(node.data?.tailwindColor) ?? "#e9e9e9";
};
