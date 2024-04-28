import { WdClassHierarchyDescOnly, WdPropertyDescOnly } from "@dataspecer/wikidata-experimental-adapter";
import { WikidataPropertyType } from "./wikidata-properties/items/wikidata-property-item";

export class PropertySelectionRecord {
    public id: string;
    public wdPropertyType: WikidataPropertyType;
    public wdProperty: WdPropertyDescOnly;
    public subjectWdClass: WdClassHierarchyDescOnly;
    public objectWdClass: WdClassHierarchyDescOnly | undefined;

    constructor(
        wdPropertyType: WikidataPropertyType, 
        wdProperty: WdPropertyDescOnly, 
        subjectWdClass: WdClassHierarchyDescOnly, 
        objectWdClass: WdClassHierarchyDescOnly | undefined = undefined
    ) {
        this.id = 
            wdProperty.id.toString() + 
            " " + wdPropertyType + 
            " " + subjectWdClass.id.toString() +
            (objectWdClass ? (" " + objectWdClass.id.toString()) : "");
        this.wdPropertyType = wdPropertyType;
        this.wdProperty = wdProperty;
        this.subjectWdClass = subjectWdClass;
        this.objectWdClass = objectWdClass;
    }
}

export function isPropertySelectionRecordPresent(record: PropertySelectionRecord, propertySelectionRecords: PropertySelectionRecord[]): boolean {
    const idx = findIndexOfPropertySelectionRecord(record, propertySelectionRecords);
    return idx !== -1;
}

export function findIndexOfPropertySelectionRecord(record: PropertySelectionRecord, propertySelectionRecords: PropertySelectionRecord[]): number {
    return propertySelectionRecords.findIndex((element) => element.id === record.id);
}

export function isPropertySelected(
    wdProperty: WdPropertyDescOnly, 
    wdPropertyType: WikidataPropertyType, 
    subjectWdClass: WdClassHierarchyDescOnly, 
    propertySelectionRecords: PropertySelectionRecord[]
): number {
    return propertySelectionRecords.findIndex((element) => { 
        return (
            element.wdProperty.id === wdProperty.id &&
            element.wdPropertyType === wdPropertyType &&
            element.subjectWdClass.id === subjectWdClass.id
        );
    });
}