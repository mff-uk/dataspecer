import { type MouseEvent, useCallback } from "react";
import { EdgeLabelRenderer, type EdgeProps, getSmoothStepPath, useStore } from "reactflow";

import { useMenuOptions } from "../components/menu-options";
import { type Point, getHandleFloatingEdgePoints } from "./geometry";

export const DefaultEdge: React.FC<EdgeProps> = (props: EdgeProps) => {
  const geometry = useEdgeGeometry(props.source, props.target);
  const { openMenuOptions } = useMenuOptions();
  //
  if (geometry === null || props.data === null) {
    return null;
  }
  // Prepare data.
  const onEdgeClick = (event: MouseEvent) => {
    event.stopPropagation();
    openMenuOptions();
  };

  return (
    <>
      <path
        id={props.id}
        className="react-flow__edge-path"
        d={geometry.path}
        strokeWidth={5}
        markerEnd={props.markerEnd}
        style={props.style}
      />
      <path
        id={props.id + ":click-handler"}
        className="react-flow__edge-path"
        d={geometry.path}
        style={{ ...props.style, strokeWidth: 12, stroke: "transparent" }}
        onDoubleClick={onEdgeClick}
      />
      <EdgeLabelRenderer>
        <div>

        </div>
      </EdgeLabelRenderer>
    </>
  );
};

function useEdgeGeometry(sourceIdentifier: string, targetIdentifier: string): {
  path: string
  source: Point,
  target: Point,
} | null {
  const source = useStore(useCallback((store) => store.nodeInternals.get(sourceIdentifier), [sourceIdentifier]));
  const target = useStore(useCallback((store) => store.nodeInternals.get(targetIdentifier), [targetIdentifier]));
  if (source === undefined || target === undefined) {
    return null;
  }
  if (sourceIdentifier === targetIdentifier) {
    // TODO Support loop
  }
  const edgePositions = getHandleFloatingEdgePoints(source, target);
  if (edgePositions === null) {
    return null;
  }
  const edgeSource = edgePositions.source;
  const edgeTarget = edgePositions.target;
  const [path] = getSmoothStepPath({
    sourceX: edgeSource.x,
    sourceY: edgeSource.y,
    sourcePosition: edgeSource.position,
    targetX: edgeTarget.x,
    targetY: edgeTarget.y,
    targetPosition: edgeTarget.position,
    borderRadius: 60,
  });
  return {
    path: path,
    source: edgeSource,
    target: edgeTarget,
  };
}
