import { WdClassHierarchyDescOnly, WdPropertyDescOnly } from "@dataspecer/wikidata-experimental-adapter";
import { WikidataPropertyType } from "./wikidata-properties/items/wikidata-property-item";

export class WdPropertySelectionRecord {
    private static idIncrement: number = 0;
    public id: number;
    public wdPropertyType: WikidataPropertyType;
    public wdProperty: WdPropertyDescOnly;
    public subjectWdClass: WdClassHierarchyDescOnly;
    public objectWdClass: WdClassHierarchyDescOnly | undefined;

    private static createNewId(): number {
        WdPropertySelectionRecord.idIncrement += 1;
        return WdPropertySelectionRecord.idIncrement;
    }

    private constructor(
        id: number,
        wdPropertyType: WikidataPropertyType, 
        wdProperty: WdPropertyDescOnly, 
        subjectWdClass: WdClassHierarchyDescOnly, 
        objectWdClass: WdClassHierarchyDescOnly | undefined = undefined
    ) {
        this.id = id;
        this.wdPropertyType = wdPropertyType;
        this.wdProperty = wdProperty;
        this.subjectWdClass = subjectWdClass;
        this.objectWdClass = objectWdClass;
    }

    public static createNew(
        wdPropertyType: WikidataPropertyType, 
        wdProperty: WdPropertyDescOnly, 
        subjectWdClass: WdClassHierarchyDescOnly, 
        objectWdClass: WdClassHierarchyDescOnly | undefined = undefined,
    ): WdPropertySelectionRecord {
        const id = WdPropertySelectionRecord.createNewId();
        return new WdPropertySelectionRecord(id, wdPropertyType, wdProperty, subjectWdClass, objectWdClass);
    }

    public static createEditedCopy(
        record: WdPropertySelectionRecord,
        newSubjectWdClass: WdClassHierarchyDescOnly, 
        newObjectWdClass: WdClassHierarchyDescOnly | undefined = undefined,
    ): WdPropertySelectionRecord {
        return new WdPropertySelectionRecord(record.id, record.wdPropertyType, record.wdProperty, newSubjectWdClass, newObjectWdClass);
    }
}

export function isWdPropertySelectionRecordPresent(record: WdPropertySelectionRecord, propertySelectionRecords: WdPropertySelectionRecord[]): boolean {
    const idx = findIndexOfWdPropertySelectionRecord(record, propertySelectionRecords);
    return idx !== -1;
}

export function findIndexOfWdPropertySelectionRecord(record: WdPropertySelectionRecord | number, propertySelectionRecords: WdPropertySelectionRecord[]): number {
    const recordId = (typeof record === 'number') ? record : record.id;
    return propertySelectionRecords.findIndex((element) => element.id === recordId);
}

export function isWdPropertySelected(
    wdProperty: WdPropertyDescOnly, 
    wdPropertyType: WikidataPropertyType, 
    propertySelectionRecords: WdPropertySelectionRecord[]
): number {
    return propertySelectionRecords.findIndex((element) => { 
        return (
            element.wdProperty.id === wdProperty.id &&
            element.wdPropertyType === wdPropertyType
        );
    });
}