

export function createRelationshipProfileAction() {

    // const domainEnd = {
    //     concept: overriddenFields.domain && changedFields.domain ? newDomain.concept : null,
    //     name: null,
    //     description: null,
    //     cardinality:
    //         overriddenFields.domainCardinality && changedFields.domainCardinality
    //             ? newDomain.cardinality ?? null
    //             : null,
    //     usageNote: null,
    //     iri: null,
    // } satisfies SemanticModelRelationshipEndUsage;
    // const rangeEnd = {
    //     concept: overriddenFields.range && changedFields.range ? newRange.concept : null,
    //     name: overriddenFields.name && changedFields.name ? name : null,
    //     description: overriddenFields.description && changedFields.description ? description : null,
    //     cardinality:
    //         overriddenFields.rangeCardinality && changedFields.rangeCardinality
    //             ? newRange.cardinality ?? null
    //             : null,
    //     usageNote: null,
    //     iri: newIri,
    // } as SemanticModelRelationshipEndUsage;

    // let ends: SemanticModelRelationshipEndUsage[];
    // if (currentDomainAndRange?.domainIndex == 1 && currentDomainAndRange.rangeIndex == 0) {
    //     ends = [rangeEnd, domainEnd];
    // } else {
    //     ends = [domainEnd, rangeEnd];
    // }

    // const { id: relationshipUsageId } = createRelationshipEntityUsage(m, e.type[0], {
    //     usageOf: e.id,
    //     usageNote: usageNote,
    //     ends: ends,
    // });

    // const visualModel = aggregatorView.getActiveVisualModel();
    // if (relationshipUsageId && isWritableVisualModel(visualModel)) {
    //     visualModel.addVisualRelationship({
    //         model: m.getId(),
    //         representedRelationship: relationshipUsageId,
    //         waypoints: [],
    //     });
    // }

}
