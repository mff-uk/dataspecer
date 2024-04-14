import { SemanticModelRelationship, SemanticModelRelationshipEnd } from "../concepts";

/**
 * Gets domain and range of a relationship.
 * @param resource
 * @returns {domain: SemanticModelRelationshipEnd, range: SemanticModelRelationshipEnd} if only one of the ends has an IRI, if both or none have it, returns null.
 */
export const getDomainAndRange = (resource: SemanticModelRelationship) => {
    let domain: SemanticModelRelationshipEnd, range: SemanticModelRelationshipEnd;
    const [end1, end2] = resource.ends;

    if (!end1 || !end2) {
        return null;
    } else if (end1!.iri && end2!.iri) {
        return null;
    } else if (end1!.iri) {
        domain = end1!;
        range = end2!;
    } else if (end2!.iri) {
        domain = end2!;
        range = end1!;
    } else {
        // none of them has an iri
        return null;
    }

    return { domain: domain, range: range };
};
