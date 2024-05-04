import {
    SemanticModelRelationship,
    SemanticModelRelationshipEnd,
    isSemanticModelRelationship,
} from "@dataspecer/core-v2/semantic-model/concepts";
import { getDomainAndRange } from "@dataspecer/core-v2/semantic-model/relationship-utils";
import {
    SemanticModelRelationshipUsage,
    isSemanticModelRelationshipUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { EntityDetailSupportedType } from "./detail-utils";

export type CardinalityOption = "unset" | "0x" | "01" | "11" | "1x" | "xx";

export const semanticCardinalityToOption = (v: null | [number, number | null]): CardinalityOption => {
    if (v == null) {
        return "unset";
    } else if (v[0] == 0 && v[1] == null) {
        return "0x";
    } else if (v[0] == 1 && v[1] == null) {
        return "1x";
    } else if (v[0] == 0 && v[1] == 1) {
        return "01";
    } else if (v[0] == 1 && v[1] == 1) {
        return "11";
    } else if (v[0] == null && v[1] == null) {
        return "xx";
    } else {
        alert("unknown cardinality option for [" + v[0] + "," + v[1]);
        return "unset";
    }
};

export const bothEndsHaveAnIri = (entity: SemanticModelRelationship | SemanticModelRelationshipUsage) => {
    if (isSemanticModelRelationship(entity)) {
        const [end1, end2] = entity.ends;
        return end1?.iri && end1.iri.length > 0 && end2?.iri && end2.iri.length > 0;
    } else {
        return false;
    }
};

export const temporaryDomainRangeHelper = (entity: EntityDetailSupportedType) => {
    if (isSemanticModelRelationship(entity)) {
        return getDomainAndRange(entity);
    } else if (isSemanticModelRelationshipUsage(entity)) {
        const e = entity as SemanticModelRelationship & SemanticModelRelationshipUsage;
        return getDomainAndRange(e);
    } else {
        return null;
    }
};
