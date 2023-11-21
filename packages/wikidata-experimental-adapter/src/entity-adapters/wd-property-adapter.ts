import { IriProvider } from "@dataspecer/core/cim";
import { IWdProperty, UnderlyingType } from "../connector/entities/wd-property";
import { CoreResource } from "@dataspecer/core/core";
import { IWdClass } from "../connector/entities/wd-class";
import { PimAssociation, PimAssociationEnd, PimAttribute } from "@dataspecer/core/pim/model";
import { entityIdToCimIri, loadWikidataEntityToResource } from "./wd-entity-adapter";
import { EntityId, EntityTypes } from "../connector/entities/wd-entity";


export type associationTypes = "inward" | "outward";


function isPropertyAttribute(wdProperty: IWdProperty): boolean {
    return wdProperty.underlyingType !== UnderlyingType.ENTITY
}


function loadOutwardAssociations(storage: CoreResource[], inOrOut: associationTypes, wdProperty: IWdProperty, rootClass: IWdClass, iriProvider: IriProvider) {
    for (const objectId of wdProperty.itemConstraints.valueType.instanceOf) {
        storage.push(...loadWikidataAssociation(inOrOut, rootClass.id, objectId, wdProperty, iriProvider));
    }
    for (const objectId of wdProperty.itemConstraints.valueType.subclassOfInstanceOf) {
        storage.push(...loadWikidataAssociation(inOrOut, rootClass.id, objectId, wdProperty, iriProvider));
    }
}

function loadInwardAssociations(storage: CoreResource[], inOrOut: associationTypes, wdProperty: IWdProperty, rootClass: IWdClass, iriProvider: IriProvider) {
    for (const subjectId of wdProperty.generalConstraints.subjectType.instanceOf) {
        storage.push(...loadWikidataAssociation(inOrOut, subjectId, rootClass.id, wdProperty, iriProvider));
    }
    for (const subjectId of wdProperty.generalConstraints.subjectType.subclassOfInstanceOf) {
        storage.push(...loadWikidataAssociation(inOrOut, subjectId, rootClass.id, wdProperty, iriProvider));
    }
}

export function loadWikidataProperty(inOrOut: associationTypes, wdProperty: IWdProperty, rootClass: IWdClass, iriProvider: IriProvider): CoreResource[] {
    if (isPropertyAttribute(wdProperty)) {
        return [loadWikidataFakeAttribute(wdProperty, rootClass, iriProvider)]
    } 
    
    const coreResources: CoreResource[] = [];    
    if (inOrOut === "outward" && wdProperty.itemConstraints != null) {
        loadOutwardAssociations(coreResources, inOrOut, wdProperty, rootClass, iriProvider);
    } else if (inOrOut === "inward") {
        loadInwardAssociations(coreResources, inOrOut, wdProperty, rootClass, iriProvider);
    }

    return coreResources;
}

function loadWikidataAssociation(inOrOut: associationTypes, startEntityId: EntityId, endEntityId: EntityId, wdProperty: IWdProperty, iriProvider: IriProvider): [PimAssociationEnd, PimAssociation, PimAssociationEnd] {
    const pimAssociation = new PimAssociation();
    loadWikidataEntityToResource(wdProperty, EntityTypes.PROPERTY, iriProvider, pimAssociation);
    pimAssociation.pimIsOriented = true;
    pimAssociation.iri += "-edge-" + inOrOut + "-" + startEntityId + "-" + endEntityId;
    
    // Subject of property
    const mediates1 = new PimAssociationEnd();
    mediates1.iri = pimAssociation.iri + "-end-1";
    mediates1.pimPart = iriProvider.cimToPim(entityIdToCimIri(startEntityId, EntityTypes.CLASS));
    
    // Object of property
    const mediates2 = new PimAssociationEnd();
    mediates2.iri = pimAssociation.iri + "-end-2";
    mediates2.pimPart = iriProvider.cimToPim(entityIdToCimIri(endEntityId, EntityTypes.CLASS));
    
    // Assign mediates to the association endpoints
    pimAssociation.pimEnd = [mediates1.iri, mediates2.iri];
    
    return [mediates1, pimAssociation, mediates2];
}


function loadWikidataFakeAttribute(wdProperty: IWdProperty, rootClass: IWdClass, iriProvider: IriProvider): PimAttribute {
    const pimAttribute = new PimAttribute();
    const rootClassCimIri = entityIdToCimIri(rootClass.id, EntityTypes.CLASS);
    loadWikidataEntityToResource(wdProperty, EntityTypes.PROPERTY, iriProvider, pimAttribute);
    pimAttribute.iri += "#fake-attribute-" + getLastPartOfIri(rootClassCimIri);
    pimAttribute.pimOwnerClass = iriProvider.cimToPim(rootClassCimIri);
    return pimAttribute;
  }
  
  function getLastPartOfIri(iri: string): string {
    return iri.split("/").pop();
  }