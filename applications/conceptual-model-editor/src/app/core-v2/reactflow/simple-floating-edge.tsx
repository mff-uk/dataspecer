import { CSSProperties, useCallback } from "react";
import {
    useStore,
    EdgeProps,
    getSimpleBezierPath,
    EdgeLabelRenderer,
    getStraightPath,
    Edge,
    MarkerType,
} from "reactflow";

import { getEdgeParams, getLoopPath } from "./utils";
import { SemanticModelRelationship, SemanticModelGeneralization } from "@dataspecer/core-v2/semantic-model/concepts";
import {
    getNameOfThingInLangOrIri,
    getNameOrIriAndDescription,
    getStringFromLanguageStringInLang,
} from "../util/language-utils";
import { number, string } from "zod";
import {
    SemanticModelClassUsage,
    SemanticModelRelationshipUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";

// this is a little helper component to render the actual edge label
const CardinalityEdgeLabel = ({
    transform,
    label,
    bgColor,
}: {
    transform: string;
    label: string;
    bgColor: string | undefined;
}) => {
    return (
        <div className="nodrag nopan absolute origin-center p-1" style={{ transform, backgroundColor: bgColor }}>
            {label}
        </div>
    );
};

type SimpleFloatingEdgeDataType = {
    label: string;
    type: "r" | "g";
    cardinalitySource?: string;
    cardinalityTarget?: string;
    bgColor?: string;
    usages?: SemanticModelRelationshipUsage[];
};

export const SimpleFloatingEdge: React.FC<EdgeProps> = ({ id, source, target, style, markerEnd, data }) => {
    const sourceNode = useStore(useCallback((store) => store.nodeInternals.get(source), [source]));
    const targetNode = useStore(useCallback((store) => store.nodeInternals.get(target), [target]));

    const d = data as SimpleFloatingEdgeDataType;

    if (!sourceNode || !targetNode) {
        return null;
    }

    const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(sourceNode, targetNode);

    let edgePath: string, labelX: number, labelY: number;

    if (sourceNode.id == targetNode.id) {
        [edgePath, labelX, labelY] = getLoopPath(sourceNode, targetNode, d.type == "r" ? "rel" : "gen");
    } else {
        [edgePath, labelX, labelY] =
            d.type == "r"
                ? getSimpleBezierPath({
                      sourceX: sx,
                      sourceY: sy,
                      sourcePosition: sourcePos,
                      targetPosition: targetPos,
                      targetX: tx,
                      targetY: ty,
                  })
                : getStraightPath({
                      sourceX: sx,
                      sourceY: sy,
                      targetX: tx,
                      targetY: ty,
                  });
    }
    return (
        <>
            <path
                id={id}
                className="react-flow__edge-path"
                d={edgePath}
                strokeWidth={1}
                markerEnd={markerEnd}
                style={style}
            />
            <EdgeLabelRenderer>
                <div
                    className="nodrag nopan absolute flex flex-col p-2"
                    style={{
                        transform: `translate(${labelX}px,${labelY}px) translate(-50%, -50%)`,
                    }}
                >
                    <div>{d.label}</div>
                    {d.usages?.map((u) => (
                        <div className="bg-blue-200">{getStringFromLanguageStringInLang(u.usageNote ?? {})[0]}</div>
                    ))}
                </div>
                {d.cardinalitySource && (
                    <CardinalityEdgeLabel
                        transform={`translate(${sx}px,${sy}px) translate(-110%,${sy > ty ? "-80" : "0"}%)`}
                        label={d.cardinalitySource}
                        bgColor={d.bgColor}
                    />
                )}
                {d.cardinalityTarget && (
                    <CardinalityEdgeLabel
                        transform={`translate(${tx}px,${ty}px) translate(${sx < tx ? "-110" : "10"}%,-10%) `}
                        label={d.cardinalityTarget}
                        bgColor={d.bgColor}
                    />
                )}
            </EdgeLabelRenderer>
        </>
    );
};

export const semanticModelRelationshipToReactFlowEdge = (
    rel: SemanticModelRelationship,
    color: string | undefined,
    usages: SemanticModelRelationshipUsage[]
) => {
    const [name, description] = getNameOrIriAndDescription(rel, rel.iri ?? rel.id);
    return {
        id: rel.id,
        source: rel.ends[0]!.concept,
        target: rel.ends[1]!.concept,
        markerEnd: { type: MarkerType.Arrow, height: 20, width: 20, color: color || "maroon" },
        type: "floating",
        data: {
            label: name ?? "",
            type: "r",
            cardinalitySource: rel.ends[0]?.cardinality?.toString(),
            cardinalityTarget: rel.ends[1]?.cardinality?.toString(),
            bgColor: color,
            usages,
        } satisfies SimpleFloatingEdgeDataType,
        style: { strokeWidth: 2, stroke: color },
    } as Edge;
};

export const semanticModelGeneralizationToReactFlowEdge = (
    gen: SemanticModelGeneralization,
    color: string | undefined
) =>
    ({
        id: gen.id,
        source: gen.child,
        target: gen.parent,
        markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            strokeWidth: 2,
        },
        type: "floating",
        data: { label: "", type: "g" } satisfies SimpleFloatingEdgeDataType,
        style: { stroke: color || "maroon", strokeWidth: 2 },
    } as Edge);

export const semanticModelClassUsageToReactFlowEdge = (
    classUsage: SemanticModelClassUsage,
    color: string | undefined
) =>
    ({
        id: classUsage.id,
        source: classUsage.id,
        target: classUsage.usageOf,
        markerEnd: { type: MarkerType.Arrow, width: 20, height: 20, color: color || "azure" },
        type: "floating",
        data: {
            label: "",
            type: "r",
        } satisfies SimpleFloatingEdgeDataType,
        style: { stroke: color || "azure", strokeWidth: 2, strokeDasharray: 5 },
    } as Edge);
