import { WdClassHierarchyDescOnly, WdPropertyDescOnly } from "@dataspecer/wikidata-experimental-adapter";
import { WikidataPropertyType } from "./wikidata-properties/wikidata-property-item";

export class WdPropertySelectionRecord {
    private static idIncrement: number = 0;
    public readonly id: number;
    public readonly wdPropertyType: WikidataPropertyType;
    public readonly wdProperty: WdPropertyDescOnly;
    public readonly subjectWdClass: WdClassHierarchyDescOnly;
    public readonly objectWdClass: WdClassHierarchyDescOnly | undefined;

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
    if (typeof record === "number") {
        return propertySelectionRecords.findIndex((element) => element.id === record);
    } else {
        return propertySelectionRecords.findIndex((element) => 
            element.wdProperty.id === record.wdProperty.id &&
            element.subjectWdClass.id === record.subjectWdClass.id &&
            element.wdPropertyType === record.wdPropertyType &&
            element?.objectWdClass?.id === record?.objectWdClass?.id
        );
    }
}

export function getAllWdPropertySelections(
    wdProperty: WdPropertyDescOnly, 
    wdPropertyType: WikidataPropertyType,
    propertySelectionRecords: WdPropertySelectionRecord[]
): WdPropertySelectionRecord[] {
    return propertySelectionRecords.filter((element) => 
        element.wdProperty.id === wdProperty.id && 
        element.wdPropertyType === wdPropertyType
    );
}