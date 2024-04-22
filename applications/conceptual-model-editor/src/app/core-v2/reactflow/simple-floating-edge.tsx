import { useCallback, useState } from "react";
import {
    useStore,
    EdgeProps,
    getSimpleBezierPath,
    EdgeLabelRenderer,
    getStraightPath,
    Edge,
    MarkerType,
    getBezierPath,
    getSmoothStepPath,
} from "reactflow";

import { getEdgeParams, getLoopPath } from "./utils";
import {
    SemanticModelRelationship,
    SemanticModelGeneralization,
    LanguageString,
    isSemanticModelRelationship,
} from "@dataspecer/core-v2/semantic-model/concepts";
import { getLocalizedStringFromLanguageString, getStringFromLanguageStringInLang } from "../util/language-utils";
import {
    SemanticModelClassUsage,
    SemanticModelRelationshipUsage,
    isSemanticModelRelationshipUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { cardinalityToString } from "../util/utils";
import { getDomainAndRange } from "@dataspecer/core-v2/semantic-model/relationship-utils";
import { useModelGraphContext } from "../context/model-context";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { useClassesContext } from "../context/classes-context";
import { getFallbackDisplayName, getNameLanguageString } from "../util/name-utils";
import { useConfigurationContext } from "../context/configuration-context";

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
        <div
            className="nodrag nopan absolute origin-center p-1"
            style={{ transform, backgroundColor: bgColor, pointerEvents: "all" }}
        >
            {label}
        </div>
    );
};

type SimpleFloatingEdgeDataType = {
    label: LanguageString | null;
    entityId: string;
    fallbackLabel: string | null;
    type: "relationship" | "relationship-profile" | "class-profile" | "generalization";
    cardinalitySource?: string;
    cardinalityTarget?: string;
    bgColor?: string;
    usageNotes?: LanguageString[];
    openEntityDetailDialog: () => void;
    openModificationDialog: (m: InMemorySemanticModel | null) => void;
    openCreateProfileDialog: () => void;
};

export const SimpleFloatingEdge: React.FC<EdgeProps> = ({ id, source, target, style, markerEnd, data }) => {
    const sourceNode = useStore(useCallback((store) => store.nodeInternals.get(source), [source]));
    const targetNode = useStore(useCallback((store) => store.nodeInternals.get(target), [target]));
    const { models } = useModelGraphContext();
    const { sourceModelOfEntityMap, deleteEntityFromModel } = useClassesContext();
    const [isMenuOptionsOpen, setIsMenuOptionsOpen] = useState(false);
    const { language: preferredLanguage } = useConfigurationContext();

    const d = data as SimpleFloatingEdgeDataType;

    const displayName = getLocalizedStringFromLanguageString(d.label, preferredLanguage) ?? d.fallbackLabel;

    if (!sourceNode || !targetNode) {
        return null;
    }

    const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(sourceNode, targetNode);

    let edgePath: string, labelX: number, labelY: number;

    if (sourceNode.id == targetNode.id) {
        [edgePath, labelX, labelY] = getLoopPath(sourceNode, targetNode, d.type != "generalization" ? "rel" : "gen");
    } else {
        if (d.type == "relationship" || d.type == "class-profile") {
            [edgePath, labelX, labelY] = getSimpleBezierPath({
                sourceX: sx,
                sourceY: sy,
                sourcePosition: sourcePos,
                targetPosition: targetPos,
                targetX: tx,
                targetY: ty,
            });
        } else if (d.type == "relationship-profile") {
            [edgePath, labelX, labelY] = getSmoothStepPath({
                sourceX: sx,
                sourceY: sy,
                sourcePosition: sourcePos,
                targetPosition: targetPos,
                targetX: tx,
                targetY: ty,
                borderRadius: 60,
            });
        } else {
            [edgePath, labelX, labelY] = getStraightPath({
                sourceX: sx,
                sourceY: sy,
                targetX: tx,
                targetY: ty,
            });
        }
    }

    const MenuOptions = () => {
        const sourceModelId = sourceModelOfEntityMap.get(d.entityId ?? " ");
        const m = models.get(sourceModelId ?? "");

        return (
            <div
                style={{ pointerEvents: "all" }}
                className="flex w-max flex-col bg-white [&>*]:px-5 [&>*]:text-left"
                onBlur={(e) => {
                    setIsMenuOptionsOpen(false);
                    e.stopPropagation();
                }}
            >
                <button
                    type="button"
                    className="text-red-700 hover:shadow"
                    onClick={(e) => {
                        setIsMenuOptionsOpen(false);
                        e.stopPropagation();
                    }}
                >
                    close
                </button>
                <button
                    type="button"
                    className="hover:shadow"
                    onClick={(e) => {
                        d.openEntityDetailDialog();
                        setIsMenuOptionsOpen(false);
                        e.stopPropagation();
                    }}
                >
                    open detail
                </button>
                {(d.type == "relationship" || d.type == "relationship-profile") && (
                    <button
                        type="button"
                        className="hover:shadow"
                        onClick={(e) => {
                            d.openCreateProfileDialog();
                            setIsMenuOptionsOpen(false);
                            e.stopPropagation();
                        }}
                    >
                        create profile
                    </button>
                )}
                {m instanceof InMemorySemanticModel &&
                    (d.type == "relationship" || d.type == "relationship-profile") && (
                        <button
                            type="button"
                            className="hover:shadow"
                            onClick={(e) => {
                                d.openModificationDialog(m);
                                setIsMenuOptionsOpen(false);
                                e.stopPropagation();
                            }}
                        >
                            modify
                        </button>
                    )}
                {m instanceof InMemorySemanticModel && (
                    <button
                        type="button"
                        className="hover:shadow"
                        onClick={(e) => {
                            deleteEntityFromModel(m, d.entityId);
                            setIsMenuOptionsOpen(false);
                            e.stopPropagation();
                        }}
                    >
                        delete
                    </button>
                )}
            </div>
        );
    };

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
            <path
                id={id + "transparent"}
                className="react-flow__edge-path"
                d={edgePath}
                style={{ ...style, strokeWidth: 12, stroke: "transparent" }}
                onDoubleClick={(e) => {
                    setIsMenuOptionsOpen(true);
                    e.stopPropagation();
                }}
            />
            <EdgeLabelRenderer>
                <div
                    className={`absolute flex flex-col bg-slate-200 p-1 ${isMenuOptionsOpen ? "z-10" : ""}`}
                    style={{
                        transform: `translate(${labelX}px,${labelY}px) translate(-50%, -50%)`,
                        pointerEvents: "all",
                    }}
                    onDoubleClick={(e) => {
                        setIsMenuOptionsOpen(true);
                        e.stopPropagation();
                    }}
                >
                    <div className="nopan bg-slate-200 hover:cursor-pointer" style={{ pointerEvents: "all" }}>
                        {d.type == "class-profile" || d.type == "relationship-profile" ? "<profile>" : ""}
                        {displayName}
                    </div>
                    {d.usageNotes
                        ?.filter((u) => Object.entries(u).length > 0)
                        .map((u) => (
                            <div className="bg-blue-200">{getStringFromLanguageStringInLang(u)[0] ?? "no usage"}</div>
                        ))}
                    {isMenuOptionsOpen && <MenuOptions />}
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
    rel: SemanticModelRelationship | SemanticModelRelationshipUsage,
    color: string | undefined,
    usageNotes: LanguageString[],
    openEntityDetailDialog: () => void,
    openModificationDialog: () => void,
    openCreateProfileDialog: () => void
) => {
    const domainAndRange = getDomainAndRange(rel as SemanticModelRelationship & SemanticModelRelationshipUsage);
    const isDashed = isSemanticModelRelationshipUsage(rel) ? { strokeDasharray: 5 } : {};

    return {
        id: rel.id,
        source: domainAndRange?.domain.concept ?? rel.ends[0]!.concept,
        target: domainAndRange?.range.concept ?? rel.ends[1]!.concept,
        markerEnd: { type: MarkerType.Arrow, height: 20, width: 20, color: color || "maroon" },
        type: "floating",
        data: {
            type: isSemanticModelRelationship(rel) ? "relationship" : "relationship-profile",
            entityId: rel.id,
            label: getNameLanguageString(rel),
            fallbackLabel: getFallbackDisplayName(rel),
            cardinalitySource: cardinalityToString(domainAndRange?.domain.cardinality ?? rel.ends[0]?.cardinality),
            cardinalityTarget: cardinalityToString(domainAndRange?.range.cardinality ?? rel.ends[1]?.cardinality),
            bgColor: color,
            usageNotes,
            openEntityDetailDialog,
            openModificationDialog,
            openCreateProfileDialog,
        } satisfies SimpleFloatingEdgeDataType,
        style: { strokeWidth: 3, stroke: color, ...isDashed },
    } as Edge;
};

export const semanticModelGeneralizationToReactFlowEdge = (
    gen: SemanticModelGeneralization,
    color: string | undefined,
    openEntityDetailDialog: () => void
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
        data: {
            type: "generalization",
            entityId: gen.id,
            label: null,
            fallbackLabel: null,
            openEntityDetailDialog,
            openModificationDialog: () => {},
            openCreateProfileDialog: () => {},
        } satisfies SimpleFloatingEdgeDataType,
        style: { stroke: color || "maroon", strokeWidth: 2 },
    } as Edge);

export const semanticModelClassUsageToReactFlowEdge = (
    classUsage: SemanticModelClassUsage,
    color: string | undefined,
    openEntityDetailDialog: () => void,
    openModificationDialog: () => void
) =>
    ({
        id: classUsage.id,
        source: classUsage.id,
        target: classUsage.usageOf,
        markerEnd: { type: MarkerType.Arrow, width: 20, height: 20, color: color || "azure" },
        type: "floating",
        data: {
            type: "class-profile",
            entityId: classUsage.id,
            label: null,
            fallbackLabel: null,
            openEntityDetailDialog,
            openModificationDialog,
            openCreateProfileDialog: () => {},
        } satisfies SimpleFloatingEdgeDataType,
        style: { stroke: color || "azure", strokeWidth: 2, strokeDasharray: 5 },
    } as Edge);
