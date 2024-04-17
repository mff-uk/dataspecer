import { NamedThing, SemanticModelEntity, isSemanticModelClass, isSemanticModelGeneralization, isSemanticModelRelationship } from "../semantic-model/concepts";
import { getDomainAndRange } from "../semantic-model/relationship-utils";
import { Cardinality, SimplifiedSemanticModel } from "./schema";

interface Context {

}

function getResourceIdentifier(resource: SemanticModelEntity): string {
    return resource.iri ?? resource.id;
}

function getResourceTitle(resource: NamedThing): string {
    return resource.name.en ?? "";
}

function getResourceDescription(resource: NamedThing): string {
    return resource.description.en ?? "";
}

function getCardinality(cardinality: [number, number | null]): Cardinality {
    if (!cardinality) {
        return "many";
    }

    if (cardinality[0] === 0 && cardinality[1] === 1) {
        return "optional-one";
    } else if (cardinality[0] === 1 && cardinality[1] === 1) {
        return "one";
    } else {
        return "many";
    }
}

export function semanticModelToSimplifiedSemanticModel(semanticModel: Record<string, SemanticModelEntity>, context: Context): SimplifiedSemanticModel {
    const entities = Object.values(semanticModel);

    const classes = entities.filter(isSemanticModelClass).map(cls => ({
        iri: getResourceIdentifier(cls),
        title: getResourceTitle(cls),
        description: getResourceDescription(cls),
    }));
    const classIris = classes.map(cls => cls.iri);

    const generalizations = entities.filter(isSemanticModelGeneralization).map(gen => ({
        iri: getResourceIdentifier(gen),
        title: "",
        description: "",
        generalClass: getResourceIdentifier(semanticModel[gen.parent]!),
        specialClass: getResourceIdentifier(semanticModel[gen.child]!),
    }));

    const allRelationships = entities.filter(isSemanticModelRelationship).map(relationship => {
        const {domain, range} = getDomainAndRange(relationship)!;

        let domainIri = "";
        if (domain.concept) {
            const domainEntity = semanticModel[domain.concept];
            domainIri = domainEntity ? getResourceIdentifier(domainEntity) : domain.concept;
        }

        let rangeIri = "";
        if (range.concept) {
            const rangeEntity = semanticModel[range.concept];
            rangeIri = rangeEntity ? getResourceIdentifier(rangeEntity) : range.concept;
        }

        return {
            iri: range.iri!,
            title: getResourceTitle(range),
            description: getResourceDescription(range),
            domain: domainIri,
            domainCardinality: getCardinality(domain.cardinality!),
            range: rangeIri,
            rangeCardinality: getCardinality(range.cardinality!),
        };
    });

    return {
        // @ts-ignore
        "$schema": "https://schemas.dataspecer.com/adapters/simplified-semantic-model.v1.0.schema.json",
        classes,
        attributes: allRelationships.filter(r => !classIris.includes(r.range)),
        relationships: allRelationships.filter(r => classIris.includes(r.range)),
        generalizations,
    };
}