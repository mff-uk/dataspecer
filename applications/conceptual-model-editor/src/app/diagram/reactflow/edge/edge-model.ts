// import {
//     type Edge,
//     MarkerType,
// } from "reactflow";

// import {
//     type LanguageString,
//     type SemanticModelRelationship,
//     type SemanticModelGeneralization,
// } from "@dataspecer/core-v2/semantic-model/concepts";

// import {
//     type SemanticModelClassUsage,
//     type SemanticModelRelationshipUsage
// } from "@dataspecer/core-v2/semantic-model/usage/concepts";

// import {
//     getDomainAndRange,
// } from "../../service/relationship-service";

// import { logger } from "../../application";

// export enum EdgeType {
//     RelationshipEdge = "RelationshipEdge",
//     GeneralizationEdge = "GeneralizationEdge",
//     ProfileEdge = "ProfileEdge",
//     RelationshipProfileEdge = "RelationshipProfileEdge",
// }

// const DEFAULT_EDGE_COLOR = "black";

// const DEFAULT_MARKER_COLOR = "black";

// export interface EdgeData {
//     /**
//      * Identifier of the entity.
//      */
//     entityIdentifier: string;
//     /**
//      * Duplicit information to entity type,
//      * just to make it easier to work with.
//      */
//     type: EdgeType;
//     /**
//      * Label to show next to source.
//      */
//     sourceLabel?: string;
//     /**
//      * Label to show next to target.
//      */
//     targetLabel?: string;
//     /**
//      * Background color for labels.
//      */
//     labelBackgroundColor?: string;
//     /**
//      * Note to show in the middle of the edge.
//      * When multiple values are given, they are placed on separate lines.
//      */
//     notes?: LanguageString[];
// }

// export interface RelationshipEdgeData extends EdgeData {

//     type: typeof EdgeType.RelationshipEdge;

//     relationship: SemanticModelRelationship;
// }

// export const semanticModelRelationshipToReactFlowEdge = (
//     relationship: SemanticModelRelationship,
//     modelColor: string | null,
// ): Edge | null => {
//     const { domain, range } = getDomainAndRange(relationship);
//     const source = domain?.concept ?? null;
//     const target = range?.concept ?? null;
//     if (source === null || target === null) {
//         logger.invalidEntity(relationship.id, "Missing ends.", { relationship, domain, range  });
//         return null;
//     }

//     const data: RelationshipEdgeData = {
//         entityIdentifier: relationship.id,
//         type: EdgeType.RelationshipEdge,
//         relationship: relationship,
//         notes: [],
//     };

//     return {
//         id: relationship.id,
//         type: "default",
//         source: source,
//         target: target,
//         markerEnd: {
//             type: MarkerType.Arrow,
//             height: 20,
//             width: 20,
//             color: modelColor ?? DEFAULT_MARKER_COLOR,
//         },
//         data: data,
//         style: {
//             stroke: modelColor ?? DEFAULT_EDGE_COLOR,
//             strokeWidth: 2,
//         },
//     };
// };

// export interface GeneralizationEdgeData extends EdgeData {

//     type: typeof EdgeType.GeneralizationEdge;

//     generalization: SemanticModelGeneralization;
// }

// export const semanticModelGeneralizationToReactFlowEdge = (
//     generalization: SemanticModelGeneralization,
//     modelColor: string | null,
// ): Edge | null => {
//     const data: GeneralizationEdgeData = {
//         entityIdentifier: generalization.id,
//         type: EdgeType.GeneralizationEdge,
//         generalization: generalization,
//         notes: [],
//     };

//     return {
//         id: generalization.id,
//         type: "default",
//         source: generalization.child,
//         target: generalization.parent,
//         markerEnd: {
//             type: MarkerType.ArrowClosed,
//             width: 20,
//             height: 20,
//             strokeWidth: 2,
//         },
//         data: data,
//         style: {
//             stroke: modelColor ?? DEFAULT_EDGE_COLOR,
//             strokeWidth: 2,
//         },
//     };
// };

// export interface ProfileEdgeData extends EdgeData {

//     type: typeof EdgeType.ProfileEdge;

//     profile: SemanticModelClassUsage;
// }

// export const semanticModelClassUsageToReactFlowEdge = (
//     profile: SemanticModelClassUsage,
//     modelColor: string | null,
// ): Edge | null => {

//     const data: ProfileEdgeData = {
//         entityIdentifier: profile.id,
//         type: EdgeType.ProfileEdge,
//         profile: profile,
//         notes: [],
//     };

//     return {
//         id: profile.id,
//         type: "default",
//         source: profile.id,
//         target: profile.usageOf,
//         markerEnd: {
//             type: MarkerType.Arrow,
//             width: 20,
//             height: 20,
//             color: modelColor ?? DEFAULT_MARKER_COLOR,
//         },
//         data: data,
//         style: {
//             stroke: modelColor ?? DEFAULT_EDGE_COLOR,
//             strokeWidth: 2,
//         }
//     };
// };

// export interface RelationshipProfileEdgeData extends EdgeData {

//     type: typeof EdgeType.RelationshipProfileEdge;

//     profile: SemanticModelRelationshipUsage;
// }

// export const semanticModelRelationshipUsageToReactFlowEdge = (
//     profile: SemanticModelRelationshipUsage,
//     modelColor: string | null,
//     label: LanguageString | null,
// ): Edge | null => {
//     const { domain, range } = getDomainAndRange(profile);
//     const source = domain?.concept ?? null;
//     const target = range?.concept ?? null;
//     if (source === null || target === null) {
//         logger.invalidEntity(profile.id, "Missing ends.", profile);
//         return null;
//     }

//     const data: RelationshipProfileEdgeData = {
//         entityIdentifier: profile.id,
//         type: EdgeType.RelationshipProfileEdge,
//         profile: profile,
//         notes: label === null ? [] : [label],
//     };

//     return {
//         id: profile.id,
//         type: "default",
//         source: source,
//         target: target,
//         markerEnd: {
//             type: MarkerType.Arrow,
//             height: 20,
//             width: 20,
//             color: modelColor ?? DEFAULT_MARKER_COLOR,
//         },
//         data: data,
//         style: {
//             stroke: modelColor ?? DEFAULT_EDGE_COLOR,
//             strokeWidth: 2,
//         }
//     };
// };
