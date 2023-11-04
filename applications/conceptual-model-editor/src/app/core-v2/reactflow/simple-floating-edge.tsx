import { useCallback } from "react";
import { useStore, EdgeProps, getSimpleBezierPath, EdgeLabelRenderer } from "reactflow";

import { getEdgeParams } from "./utils";

export const SimpleFloatingEdge: React.FC<EdgeProps> = ({ id, source, target, style, markerEnd, data }) => {
    const sourceNode = useStore(useCallback((store) => store.nodeInternals.get(source), [source]));
    const targetNode = useStore(useCallback((store) => store.nodeInternals.get(target), [target]));

    if (!sourceNode || !targetNode) {
        return null;
    }

    const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(sourceNode, targetNode);

    const [edgePath, labelX, labelY] = getSimpleBezierPath({
        sourceX: sx,
        sourceY: sy,
        sourcePosition: sourcePos,
        targetPosition: targetPos,
        targetX: tx,
        targetY: ty,
    });

    return (
        <>
            <path
                id={id}
                className="react-flow__edge-path"
                d={edgePath}
                strokeWidth={5}
                markerEnd={markerEnd}
                style={style}
            />
            <EdgeLabelRenderer>
                <div
                    className="nodrag nopan  absolute bg-teal-500  p-2"
                    style={{
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                    }}
                >
                    {data.label}
                </div>
            </EdgeLabelRenderer>
        </>
    );
};

export default SimpleFloatingEdge;
