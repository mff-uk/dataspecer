import { IriProvider } from "@dataspecer/core/cim";
import { PimAssociation, PimAssociationEnd, PimAttribute } from "@dataspecer/core/pim/model";
import { loadWikidataEntityToResource } from "./wd-entity-adapter.ts";
import { WdPropertyDescOnly } from "../wikidata-entities/wd-property.ts";
import { WdClassDescOnly } from "../wikidata-entities/wd-class.ts";

/**
 * The loading creates a fake IRI to the association defined by the domain and range of the selected property.
 * That is done in order to conform to the Dataspecer model, since it cannot handle multiple ranges/domains. 
 */
export function loadWikidataAssociation(wdProperty: WdPropertyDescOnly, subjectWdClass: WdClassDescOnly, objectWdClass: WdClassDescOnly, isInward: boolean, iriProvider: IriProvider): [PimAssociationEnd, PimAssociation, PimAssociationEnd] {
    const pimAssociation = new PimAssociation();
    loadWikidataEntityToResource(wdProperty, iriProvider, pimAssociation);
    pimAssociation.pimIsOriented = true;
    pimAssociation.iri += "?domain=" + subjectWdClass.iri + "&range=" + objectWdClass.iri + "&orientation=" + (isInward ? "in" : "out");
    
    const mediates1 = new PimAssociationEnd();
    mediates1.iri = pimAssociation.iri + "#end-1";
    mediates1.pimPart = iriProvider.cimToPim(subjectWdClass.iri);
    
    const mediates2 = new PimAssociationEnd();
    mediates2.iri = pimAssociation.iri + "#end-2";
    mediates2.pimPart = iriProvider.cimToPim(objectWdClass.iri);
    
    // Assign mediates to the association endpoints
    pimAssociation.pimEnd = [mediates1.iri, mediates2.iri];
    
    return [mediates1, pimAssociation, mediates2];
}

export function loadWikidataAttribute(wdProperty: WdPropertyDescOnly, subjectWdClass: WdClassDescOnly, iriProvider: IriProvider): PimAttribute {
    const pimAttribute = new PimAttribute();
    loadWikidataEntityToResource(wdProperty, iriProvider, pimAttribute);
    pimAttribute.iri += "?domain=" + subjectWdClass.iri
    pimAttribute.pimOwnerClass = iriProvider.cimToPim(subjectWdClass.iri);
    return pimAttribute;
}