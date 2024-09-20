import { type MouseEvent, MouseEventHandler, useCallback, useMemo } from "react";

import { EdgeLabelRenderer, type EdgeProps, getSmoothStepPath, useStore } from "reactflow";

import { useMenuOptions } from "../components/menu-options";
import { sourceModelOfEntity } from "../../util/model-utils";
import { type EdgeData, EdgeType } from "./edge-model";

import { type Point, getFloatingEdgePoints, getHandleFloatingEdgePoints } from "./geometry";
import { useConfigurationContext } from "../../context/configuration-context";
import { useModelGraphContext } from "../../context/model-context";
import { useClassesContext } from "../../context/classes-context";
import { useDialogsContext } from "../../context/dialogs-context";
import { findSourceModelOfEntity } from "../../service/model-service";
import { cardinalityToString, getDomainAndRange } from "../../service/relationship-service";
import { type SemanticModelRelationship, SemanticModelRelationshipEnd } from "@dataspecer/core-v2/semantic-model/concepts";
import { type SemanticModelRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";

export const DefaultEdge: React.FC<EdgeProps> = (props: EdgeProps) => {
  const geometry = useEdgeGeometry(props.source, props.target);
  const configuration = useConfigurationContext();
  const { aggregatorView, models } = useModelGraphContext();
  const { deleteEntityFromModel } = useClassesContext();
  const { openDetailDialog, openModificationDialog, openProfileDialog } = useDialogsContext();
  const { MenuOptions, isMenuOptionsOpen, openMenuOptions } = useMenuOptions();
  const edgeData = props.data as EdgeData;
  const model = useMemo(() => findSourceModelOfEntity(edgeData.entityIdentifier, models), [edgeData.entityIdentifier, models]);
  //
  if (geometry === null || props.data === null) {
    return null;
  }
  // Prepare data.
  const onEdgeClick = (event: MouseEvent) => {
    event.stopPropagation();
    openMenuOptions();
  };

  const shouldRenderCardinalities = edgeData.type === EdgeType.RelationshipProfileEdge;

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
    // TODO Support loop!
  }
  const edgePositions = getHandleFloatingEdgePoints(source, target);
  // const edgePositions = getFloatingEdgePoints(source, target);
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

function renderCardinalities(
  data: EdgeData,
  relationship: SemanticModelRelationship | SemanticModelRelationshipUsage,
  source: Point, target: Point, backgroundColor: string
) {


  const {domain, range} = getDomainAndRange(relationship);
  const cardinalitySource = cardinalityToString(domain?.cardinality);
  const cardinalityTarget = cardinalityToString(range?.cardinality);
  return (
    <>
      {renderCardinality(source, target, cardinalitySource, backgroundColor)}
      {renderCardinality(target, source, cardinalityTarget, backgroundColor)}
    </>
  );
}

function renderCardinality(source: Point, target: Point, label: string | null, backgroundColor: string) {
  if (label === null) {
    return null;
  }
  const transform = `translate(${source.x}px,${source.y}px) translate(-110%,${source.y > target.y ? "-80" : "0"}%)`;
  return (
    <div
      className="nodrag nopan absolute origin-center p-1"
      style={{
        transform,
        backgroundColor,
        pointerEvents: "all"
      }}
    >
      {label}
    </div>
  );
}


