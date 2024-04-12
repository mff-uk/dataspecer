import { LanguageString, SemanticModelRelationship, SemanticModelRelationshipEnd } from "../concepts";

export const getDomainAndRange = (resource: SemanticModelRelationship) => {
    let domain: SemanticModelRelationshipEnd, range: SemanticModelRelationshipEnd;
    const [end1, end2] = resource.ends;

    if (!end1 || !end2) {
        return null;
    } else if (end1!.iri && end2!.iri) {
        console.log("both ends have an iri, cannot decide which is domain and range", resource);
        return null;
    } else if (end1!.iri) {
        domain = end1!;
        range = end2!;
    } else if (end2!.iri) {
        domain = end2!;
        range = end1!;
    } else {
        // none of them has an iri
        console.log("none of the ends has an iri, cannot decide which is domain and range", resource);
        return null;
    }

    return { domain: domain, range: range };
};
