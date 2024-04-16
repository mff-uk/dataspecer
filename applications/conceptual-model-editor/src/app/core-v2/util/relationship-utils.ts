import {
    SemanticModelRelationship,
    SemanticModelRelationshipEnd,
    isSemanticModelRelationship,
} from "@dataspecer/core-v2/semantic-model/concepts";
import { getDomainAndRange } from "@dataspecer/core-v2/semantic-model/relationship-utils";
import { SemanticModelRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";

export const bothEndsHaveAnIri = (entity: SemanticModelRelationship | SemanticModelRelationshipUsage) => {
    if (isSemanticModelRelationship(entity)) {
        const [end1, end2] = entity.ends;
        return end1?.iri && end1.iri.length > 0 && end2?.iri && end2.iri.length > 0;
    } else {
        return false;
    }
};

export const temporaryDomainRangeHelper = (entity: SemanticModelRelationship | SemanticModelRelationshipUsage) => {
    if (isSemanticModelRelationship(entity)) {
        return getDomainAndRange(entity);
    } else {
        return {
            domain: entity.ends.at(0)! as unknown as SemanticModelRelationshipEnd,
            range: entity.ends.at(1)! as unknown as SemanticModelRelationshipEnd,
        };
    }
};
