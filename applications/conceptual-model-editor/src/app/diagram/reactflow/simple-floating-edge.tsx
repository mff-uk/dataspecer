import { useCallback, useMemo } from "react";
import {
    type Edge,
    type EdgeProps,
    EdgeLabelRenderer,
    MarkerType,
    getSimpleBezierPath,
    getStraightPath,
    getSmoothStepPath,
    useStore,
} from "reactflow";
import { getEdgeParams, getLoopPath } from "./utils";
import {
    type SemanticModelRelationship,
    type SemanticModelGeneralization,
    type LanguageString,
    isSemanticModelRelationship,
    isSemanticModelGeneralization,
} from "@dataspecer/core-v2/semantic-model/concepts";
import {
    type SemanticModelClassUsage,
    type SemanticModelRelationshipUsage,
    isSemanticModelClassUsage,
    isSemanticModelRelationshipUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { cardinalityToString } from "../util/utils";
import { getDomainAndRange } from "@dataspecer/core-v2/semantic-model/relationship-utils";
import { useModelGraphContext } from "../context/model-context";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { useClassesContext } from "../context/classes-context";
import { useConfigurationContext } from "../context/configuration-context";
import { sourceModelOfEntity } from "../util/model-utils";
import { EntityProxy } from "../util/detail-utils";
import { useMenuOptions } from "./components/menu-options";
import { EdgeNameLabel } from "./components/edge-name-label";
import { EdgeUsageNotesLabel } from "./components/edge-usage-notes-label";
import { CardinalityEdgeLabel } from "./components/edge-cardinality-label";
import { useDialogsContext } from "../context/dialogs-context";

type SimpleFloatingEdgeDataType = {
    entity:
        | SemanticModelRelationship
        | SemanticModelRelationshipUsage
        | SemanticModelClassUsage
        | SemanticModelGeneralization;
    cardinalitySource?: string;
    cardinalityTarget?: string;
    bgColor?: string;
    usageNotes?: LanguageString[];
};

export const SimpleFloatingEdge: React.FC<EdgeProps> = ({ id, source, target, style, markerEnd, data }) => {
    const sourceNode = useStore(useCallback((store) => store.nodeInternals.get(source), [source]));
    const targetNode = useStore(useCallback((store) => store.nodeInternals.get(target), [target]));
    const { aggregatorView, models } = useModelGraphContext();
    const { deleteEntityFromModel } = useClassesContext();
    const { language: preferredLanguage } = useConfigurationContext();
    const { openDetailDialog, openModificationDialog, openProfileDialog } = useDialogsContext();
    const { MenuOptions, isMenuOptionsOpen, openMenuOptions } = useMenuOptions();

    const d = data as SimpleFloatingEdgeDataType;
    const { entity } = d;

    const model = useMemo(() => sourceModelOfEntity(entity.id, [...models.values()]), [entity.id, models]);

    const isProfile = isSemanticModelRelationshipUsage(entity) || isSemanticModelClassUsage(entity);

    let displayName: string | null = null;
    let parentNames = [] as string[];
    if (isSemanticModelGeneralization(entity) || isSemanticModelClassUsage(entity)) {
        displayName = null;
    } else {
        const proxy = EntityProxy(entity, preferredLanguage);
        displayName = proxy.name;
        parentNames = proxy.specializationOf
            .map((parent) => EntityProxy(parent, preferredLanguage).name)
            .filter((n): n is string => n != null);
    }

    if (!sourceNode || !targetNode) {
        return null;
    }

    const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(sourceNode, targetNode);

    let edgePath: string, labelX: number, labelY: number;

    if (sourceNode.id == targetNode.id) {
        [edgePath, labelX, labelY] = getLoopPath(
            sourceNode,
            targetNode,
            isSemanticModelGeneralization(entity) ? "gen" : "rel"
        );
    } else {
        if (isSemanticModelRelationship(entity) || isSemanticModelClassUsage(entity)) {
            [edgePath, labelX, labelY] = getSimpleBezierPath({
                sourceX: sx,
                sourceY: sy,
                sourcePosition: sourcePos,
                targetPosition: targetPos,
                targetX: tx,
                targetY: ty,
            });
        } else if (isSemanticModelRelationshipUsage(entity)) {
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

    const handleRemoveEntityFromActiveView = (entityId: string) => {
        const updateStatus = aggregatorView.getActiveVisualModel()?.updateEntity(entityId, { visible: false });
        if (!updateStatus) {
            aggregatorView.getActiveVisualModel()?.addEntity({ sourceEntityId: entityId, visible: false });
        }
    };

    const modelIsLocal = model instanceof InMemorySemanticModel;
    const isRelationshipOrUsage = isSemanticModelRelationship(entity) || isSemanticModelRelationshipUsage(entity);

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
                    openMenuOptions();
                    e.stopPropagation();
                }}
            />
            <EdgeLabelRenderer>
                <div
                    className={`absolute flex flex-col bg-slate-200 ${
                        !isSemanticModelGeneralization(entity) ? "p-1" : ""
                    } ${isMenuOptionsOpen ? "z-10" : ""}`}
                    style={{
                        transform: `translate(${labelX}px,${labelY}px) translate(-50%, -50%)`,
                        pointerEvents: "all",
                    }}
                    onDoubleClick={(e) => {
                        openMenuOptions();
                        e.stopPropagation();
                    }}
                >
                    <EdgeNameLabel name={displayName} isProfile={isProfile} hasParents={parentNames} />
                    <EdgeUsageNotesLabel usageNotes={d.usageNotes} />
                    {isMenuOptionsOpen && (
                        <MenuOptions
                            openDetailHandler={() => openDetailDialog(entity)}
                            createProfileHandler={isRelationshipOrUsage ? () => openProfileDialog(entity) : undefined}
                            removeFromViewHandler={
                                isRelationshipOrUsage ? () => handleRemoveEntityFromActiveView(entity.id) : undefined
                            }
                            modifyHandler={
                                isRelationshipOrUsage && modelIsLocal
                                    ? () => openModificationDialog(entity, model)
                                    : undefined
                            }
                            deleteHandler={modelIsLocal ? () => deleteEntityFromModel(model, entity.id) : undefined}
                        />
                    )}
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
    usageNotes: LanguageString[]
) => {
    const domainAndRange = getDomainAndRange(rel as SemanticModelRelationship & SemanticModelRelationshipUsage);
    const isDashed = isSemanticModelRelationshipUsage(rel) ? { strokeDasharray: 5 } : {};

    return {
        id: rel.id,
        source: domainAndRange?.domain.concept ?? rel.ends[0]!.concept, // eslint-disable-line @typescript-eslint/no-non-null-assertion
        target: domainAndRange?.range.concept ?? rel.ends[1]!.concept, // eslint-disable-line @typescript-eslint/no-non-null-assertion
        markerEnd: { type: MarkerType.Arrow, height: 20, width: 20, color: color || "maroon" },
        type: "floating",
        data: {
            entity: rel,
            cardinalitySource: cardinalityToString(domainAndRange?.domain.cardinality ?? rel.ends[0]?.cardinality),
            cardinalityTarget: cardinalityToString(domainAndRange?.range.cardinality ?? rel.ends[1]?.cardinality),
            bgColor: color,
            usageNotes,
        } satisfies SimpleFloatingEdgeDataType,
        style: { strokeWidth: 3, stroke: color, ...isDashed },
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
        data: {
            entity: gen,
        } satisfies SimpleFloatingEdgeDataType,
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
            entity: classUsage,
        } satisfies SimpleFloatingEdgeDataType,
        style: { stroke: color || "azure", strokeWidth: 2, strokeDasharray: 5 },
    } as Edge);
