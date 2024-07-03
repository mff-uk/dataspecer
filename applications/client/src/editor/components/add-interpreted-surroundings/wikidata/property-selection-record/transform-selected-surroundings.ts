import { CoreResource } from "@dataspecer/core/core/core-resource";
import { WdClassSurroundings, WdEntityId, WdEntityIri, WdUnderlyingType } from "@dataspecer/wikidata-experimental-adapter";
import { WikidataAdapterContextValue } from "../../../wikidata/wikidata-adapter-context";
import { WdPropertySelectionRecord } from "./property-selection-record";
import { WikidataPropertyType } from "../wikidata-properties-panel/wikidata-properties/wikidata-property-item";

export function transformSelectedSurroundings(
    selection: WdPropertySelectionRecord[], adapterContext: WikidataAdapterContextValue, surroundings: WdClassSurroundings
): [[string, boolean][], { [iri: string]: CoreResource }] {
    const resourcesToAdd: [string, boolean][] = [];
    const resources: { [iri: string]: CoreResource } = {};
    const loadedClassesSet = new Set<WdEntityId>();
    const loadedPropertiesSet = new Set<WdEntityIri>();

    // Load hierarchy
    adapterContext.wdAdapter.tryLoadClassesToResources(
        [surroundings.startClassId, ...surroundings.parentsIds], 
        resources, 
        loadedClassesSet, 
        surroundings.classesMap
    );

    // Load Properties with endpoints
    selection.forEach((record) => {
        if (record.wdProperty.underlyingType !== WdUnderlyingType.ENTITY) {
            transformSelectedAttribute(record, adapterContext, resources, resourcesToAdd, loadedClassesSet, loadedPropertiesSet);
        } else {
            transformSelectedAssociation(record, adapterContext, resources, resourcesToAdd, loadedClassesSet, loadedPropertiesSet);
        }
    });

    return [resourcesToAdd, resources];
}

function transformSelectedAttribute(
    record: WdPropertySelectionRecord, 
    adapterContext: WikidataAdapterContextValue, 
    resources: { [iri: string]: CoreResource }, 
    resourcesToAdd: [string, boolean][],
    loadedClassesSet: Set<WdEntityId>,
    loadedPropertiesSet: Set<WdEntityIri>
): void {
    const attribute = adapterContext.wdAdapter.tryLoadAttributeToResource(
        record.wdProperty, record.subjectWdClass, resources, loadedPropertiesSet
    );
    if (attribute !== undefined) {
        adapterContext.wdAdapter.tryLoadClassToResource(record.subjectWdClass, resources, loadedClassesSet);
        resourcesToAdd.push([attribute.iri, true]); 
    }
}

function transformSelectedAssociation(
    record: WdPropertySelectionRecord, 
    adapterContext: WikidataAdapterContextValue, 
    resources: { [iri: string]: CoreResource }, 
    resourcesToAdd: [string, boolean][],
    loadedClassesSet: Set<WdEntityId>,
    loadedPropertiesSet: Set<WdEntityIri>
): void {
    const isInward = record.wdPropertyType === WikidataPropertyType.BACKWARD_ASSOCIATIONS;
    let subject = record.subjectWdClass;
    let object = record.objectWdClass;
    if (isInward) {
        [subject, object] = [object, subject];
    }
    
    const association = adapterContext.wdAdapter.tryLoadAssociationToResource(
        record.wdProperty, subject, object, isInward, resources, loadedPropertiesSet
    );
    if (association !== undefined) {
        adapterContext.wdAdapter.tryLoadClassToResource(record.subjectWdClass, resources, loadedClassesSet);
        adapterContext.wdAdapter.tryLoadClassToResource(record.objectWdClass, resources, loadedClassesSet);
        resourcesToAdd.push([association.iri, !isInward]);
    }
}