import { Entity } from "../../entity-model";
import {
    SemanticModelClass,
    SemanticModelGeneralization,
    SemanticModelRelationship,
    SemanticModelRelationshipEnd,
} from "./concepts";

export const SEMANTIC_MODEL_CLASS = "class"; // todo use proper IRI
export function isSemanticModelClass(resource: Entity | null): resource is SemanticModelClass {
    return resource?.type.includes(SEMANTIC_MODEL_CLASS) ?? false;
}

export const SEMANTIC_MODEL_RELATIONSHIP = "relationship"; // todo use proper IRI
export function isSemanticModelRelationship(resource: Entity | null): resource is SemanticModelRelationship {
    return resource?.type.includes(SEMANTIC_MODEL_RELATIONSHIP) ?? false;
}

export const SEMANTIC_MODEL_GENERALIZATION = "generalization"; // todo use proper IRI
export function isSemanticModelGeneralization(resource: Entity | null): resource is SemanticModelGeneralization {
    return resource?.type.includes(SEMANTIC_MODEL_GENERALIZATION) ?? false;
}

export function isSemanticModelAttribute(resource: Entity | null): resource is SemanticModelRelationship {
    if (!isSemanticModelRelationship(resource)) {
        return false;
    }
    const [end1, end2] = resource.ends;

    return (
        (end1?.iri != null &&
            end2?.iri == null &&
            semanticModelRelationshipEndConceptIsNullEmptyOrDataType(end1, resource)) ||
        (end2?.iri != null &&
            end1?.iri == null &&
            semanticModelRelationshipEndConceptIsNullEmptyOrDataType(end2, resource))
    );
}

function semanticModelRelationshipEndConceptIsNullEmptyOrDataType(
    resourceEnd: SemanticModelRelationshipEnd,
    resource: SemanticModelRelationship
) {
    return (
        resourceEnd.concept == null ||
        resourceEnd.concept == "" /* TODO: dataType and other logic */ ||
        resource.id.endsWith("#attribute")
    );
}

export function getDomainAndRange(resource: SemanticModelRelationship) {
    let domain: SemanticModelRelationshipEnd, range: SemanticModelRelationshipEnd;
    const [end1, end2] = resource.ends;
    if (end1!.iri && end2!.iri) {
        console.error("unsupported attribute type, has two ends with iris", resource);
        throw new Error("unsupported attribute type, has two ends with iris");
    } else if (end1!.iri) {
        domain = end1!;
        range = end2!;
    } else if (end2!.iri) {
        domain = end2!;
        range = end1!;
    } else {
        // none of them has iri
        console.error("unsupported attribute type, none of the two ends has iri", resource);
        throw new Error("unsupported attribute type, none of the two ends has iri");
    }

    return { domain: domain, range: range };
}
