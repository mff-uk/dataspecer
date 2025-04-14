import { SemanticModelRelationship, SemanticModelRelationshipEnd } from "../concepts/index.ts";

/**
 * Gets domain and range of a relationship.
 * @param resource
 * @returns {domain: SemanticModelRelationshipEnd, range: SemanticModelRelationshipEnd} if only one of the ends has an IRI, if both or none have it, returns null.
 */
export const getDomainAndRange = (resource: SemanticModelRelationship) => {
    let domain: SemanticModelRelationshipEnd, range: SemanticModelRelationshipEnd;
    const [end1, end2] = resource.ends;
    let domainIndex: number, rangeIndex: number;

    if (!end1 || !end2) {
        return null;
    } else if (end1.iri && end2.iri) {
        return null;
    } else if (end1.iri) {
        domain = end2;
        domainIndex = 1;
        range = end1;
        rangeIndex = 0;
    } else if (end2.iri) {
        domain = end1;
        domainIndex = 0;
        range = end2;
        rangeIndex = 1;
    } else {
        // none of them has an iri
        return null;
    }

    return { domain, range, domainIndex, rangeIndex };
};
