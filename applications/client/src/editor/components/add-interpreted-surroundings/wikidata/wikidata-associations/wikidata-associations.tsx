import { 
    WdClassHierarchySurroundingsDescOnly, 
    WdClassSurroundings, 
    WdDatatype, 
    WdEntityId, 
    WdEntityIdsList, 
    WdFilterByInstance, 
    WdPropertyDescOnly
} from "@dataspecer/wikidata-experimental-adapter"
import { entitySearchTextFilter } from "../helpers/search-text-filter";

export interface WikidataAssociationsProperties {
    wdClassSurroundings: WdClassSurroundings;
}

interface WdPropertiesGroups {
    attributeWdProperties: WdPropertyDescOnly[];
    identifierWdProperties: WdPropertyDescOnly[];
    inItemWdProperties: WdPropertyDescOnly[];
    outItemWdProperties: WdPropertyDescOnly[];
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
    const attributeProperties: WdPropertyDescOnly[] = [];
    const identifierProperties: WdPropertyDescOnly[] = [];
    const outProperties: WdPropertyDescOnly[] = [];
  
    inAndOutProperties.outWdProperties.forEach((wdProperty) => {
      if (wdProperty.datatype === WdDatatype.ITEM) {
        outProperties.push(wdProperty);
      } else if (wdProperty.datatype === WdDatatype.EXTERNAL_IDENTIFIER) {
        identifierProperties.push(wdProperty);
      } else {
        attributeProperties.push(wdProperty);
      }
    });
  
    return {
      attributeWdProperties: attributeProperties,
      identifierWdProperties: identifierProperties,
      outItemWdProperties: outProperties,
      inItemWdProperties: inAndOutProperties.inWdProperties,
    };
}

function conditionalTextFilter(
    condition: boolean,
    wdProperties: WdPropertyDescOnly[],
    searchText: string | undefined,
  ) {
    if (condition) {
      return entitySearchTextFilter(searchText, wdProperties);
    } else return [];
  }

export const WikidataAssociations: React.FC<WikidataAssociationsProperties> = ({wdClassSurroundings}) => {
    return <></>
}