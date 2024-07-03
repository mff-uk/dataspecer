import {
    WdClassHierarchySurroundingsDescOnly,
    WdClassSurroundings,
    WdDatatype,
    WdEntityId,
    WdEntityIdsList,
    WdFilterByInstance,
    WdPropertyDescOnly,
} from "@dataspecer/wikidata-experimental-adapter";
import { entitySearchTextFilter } from "../../helpers/search-text-filter";
import { Dispatch, SetStateAction, useEffect, useMemo } from "react";
import { WikidataPropertiesAccordion } from "./wikidata-properties-accordion";
import { WikidataPropertyType } from "./wikidata-property-item";
import { isValidSubclassingOfWdFilterByInstance } from "../wikidata-filter-by-instance-dialog/check-subclassing-of-instance";

export interface WikidataPropertiesProps {
    selectedWdClassSurroundings: WdClassSurroundings;
    wdFilterByInstance: WdFilterByInstance | undefined;
    searchText: string;
    includeInheritedProperties: boolean;
    setIsValidSubclassingOfWdFilterByInstance: Dispatch<SetStateAction<boolean>>;
}

interface WdPropertiesGroups {
    attributeWdProperties: WdPropertyDescOnly[];
    externalIdentifierWdProperties: WdPropertyDescOnly[];
    associationWdProperties: WdPropertyDescOnly[];
    backwardAssociationWdProperties: WdPropertyDescOnly[];
}

interface InAndOutWdProperties {
    outWdProperties: WdPropertyDescOnly[];
    inWdProperties: WdPropertyDescOnly[];
}

function materializeWdProperties(
    wdPropertiesIds: WdEntityIdsList,
    wdClassSurroundings: WdClassSurroundings,
    wdFilterRecordsMap: ReadonlyMap<WdEntityId, WdEntityIdsList> | undefined,
): WdPropertyDescOnly[] {
    const results: WdPropertyDescOnly[] = [];
    wdPropertiesIds.forEach((propertyId) => {
        const wdProperty = wdClassSurroundings.propertiesMap.get(propertyId);
        if (wdProperty != null) {
            if (wdFilterRecordsMap == null) results.push(wdProperty);
            else if (wdFilterRecordsMap != null && wdFilterRecordsMap.has(wdProperty.id)) {
                results.push(wdProperty);
            }
        }
    });
    return results;
}

function retrieveInAndOutWdProperties(
    wdClass: WdClassHierarchySurroundingsDescOnly,
    wdClassSurroundings: WdClassSurroundings,
    includeInheritedProperties: boolean,
    wdFilterByInstance: WdFilterByInstance | undefined,
): InAndOutWdProperties {
    let outWdPropertiesIds: WdEntityIdsList = [];
    let inWdPropertiesIds: WdEntityIdsList = [];

    if (includeInheritedProperties) {
        outWdPropertiesIds = wdClassSurroundings.subjectOfIds;
        inWdPropertiesIds = wdClassSurroundings.valueOfIds;
    } else {
        outWdPropertiesIds = wdClass.subjectOfProperty;
        inWdPropertiesIds = wdClass.valueOfProperty;
    }
    return {
        outWdProperties: materializeWdProperties(
            outWdPropertiesIds,
            wdClassSurroundings,
            wdFilterByInstance?.subjectOfFilterRecordsMap,
        ),
        inWdProperties: materializeWdProperties(
            inWdPropertiesIds,
            wdClassSurroundings,
            wdFilterByInstance?.valueOfFilterRecordsMap,
        ),
    };
}

function splitWdPropertiesIntoGroups(inAndOutProperties: InAndOutWdProperties): WdPropertiesGroups {
    const attributeWdProperties: WdPropertyDescOnly[] = [];
    const externalIdentifierWdProperties: WdPropertyDescOnly[] = [];
    const associationWdProperties: WdPropertyDescOnly[] = [];

    inAndOutProperties.outWdProperties.forEach((wdProperty) => {
        if (wdProperty.datatype === WdDatatype.ITEM) associationWdProperties.push(wdProperty);
        else if (wdProperty.datatype === WdDatatype.EXTERNAL_IDENTIFIER)
            externalIdentifierWdProperties.push(wdProperty);
        else attributeWdProperties.push(wdProperty);
    });

    return {
        attributeWdProperties: attributeWdProperties,
        externalIdentifierWdProperties: externalIdentifierWdProperties,
        associationWdProperties: associationWdProperties,
        backwardAssociationWdProperties: inAndOutProperties.inWdProperties,
    };
}

export const WikidataProperties: React.FC<WikidataPropertiesProps> = ({
    selectedWdClassSurroundings,
    wdFilterByInstance,
    searchText,
    includeInheritedProperties,
    setIsValidSubclassingOfWdFilterByInstance
}) => {
    const wdPropertiesGroups = useMemo<WdPropertiesGroups>(() => {
        const selectedWdClass = selectedWdClassSurroundings.classesMap.get(
            selectedWdClassSurroundings.startClassId,
        ) as WdClassHierarchySurroundingsDescOnly;
        const inAndOutWdProperties: InAndOutWdProperties = retrieveInAndOutWdProperties(
            selectedWdClass,
            selectedWdClassSurroundings,
            includeInheritedProperties,
            wdFilterByInstance,
        );
        return splitWdPropertiesIntoGroups(inAndOutWdProperties);
    }, [includeInheritedProperties, selectedWdClassSurroundings, wdFilterByInstance]);

    const filteredWdPropertiesGroups = useMemo<WdPropertiesGroups>(() => {
        return {
            attributeWdProperties: entitySearchTextFilter(
                searchText,
                wdPropertiesGroups.attributeWdProperties,
            ),
            externalIdentifierWdProperties: entitySearchTextFilter(
                searchText,
                wdPropertiesGroups.externalIdentifierWdProperties,
            ),
            associationWdProperties: entitySearchTextFilter(
                searchText,
                wdPropertiesGroups.associationWdProperties,
            ),
            backwardAssociationWdProperties: entitySearchTextFilter(
                searchText,
                wdPropertiesGroups.backwardAssociationWdProperties,
            ),
        };
    }, [searchText, wdPropertiesGroups]);

    useEffect(() => {
        if (wdFilterByInstance !== undefined) {
            setIsValidSubclassingOfWdFilterByInstance(
                isValidSubclassingOfWdFilterByInstance(selectedWdClassSurroundings, wdFilterByInstance)
            );
        }
    }, [selectedWdClassSurroundings, setIsValidSubclassingOfWdFilterByInstance, wdFilterByInstance]);


    return (
        <>
            <WikidataPropertiesAccordion
                key={WikidataPropertyType.ATTRIBUTES}
                wdPropertyType={WikidataPropertyType.ATTRIBUTES}
                wdProperties={filteredWdPropertiesGroups.attributeWdProperties}
                selectedWdClassSurroundings={selectedWdClassSurroundings}
                includeInheritedProperties={includeInheritedProperties}
                wdFilterByInstance={wdFilterByInstance}
            />
            <WikidataPropertiesAccordion
                key={WikidataPropertyType.EXTERNAL_IDENTIFIERS_ATTRIBUTES}
                wdPropertyType={WikidataPropertyType.EXTERNAL_IDENTIFIERS_ATTRIBUTES}
                wdProperties={filteredWdPropertiesGroups.externalIdentifierWdProperties}
                selectedWdClassSurroundings={selectedWdClassSurroundings}
                includeInheritedProperties={includeInheritedProperties}
                wdFilterByInstance={wdFilterByInstance}
            />
            <WikidataPropertiesAccordion
                key={WikidataPropertyType.ASSOCIATIONS}
                wdPropertyType={WikidataPropertyType.ASSOCIATIONS}
                wdProperties={filteredWdPropertiesGroups.associationWdProperties}
                selectedWdClassSurroundings={selectedWdClassSurroundings}
                includeInheritedProperties={includeInheritedProperties}
                wdFilterByInstance={wdFilterByInstance}
            />
            <WikidataPropertiesAccordion
                key={WikidataPropertyType.BACKWARD_ASSOCIATIONS}
                wdPropertyType={WikidataPropertyType.BACKWARD_ASSOCIATIONS}
                wdProperties={filteredWdPropertiesGroups.backwardAssociationWdProperties}
                selectedWdClassSurroundings={selectedWdClassSurroundings}
                includeInheritedProperties={includeInheritedProperties}
                wdFilterByInstance={wdFilterByInstance}
            />
        </>
    );
};
