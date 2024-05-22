import { WdClassHierarchyDescOnly } from "@dataspecer/wikidata-experimental-adapter";
import { useState, useMemo, useCallback } from "react";
import { WdPropertySelectionContextValue } from "../contexts/wd-property-selection-context";
import { WdPropertySelectionRecord, findIndexOfWdPropertySelectionRecord, isWdPropertySelectionRecordPresent } from "../property-selection-record/property-selection-record";

export function useWdPropertySelection() {
    const [wdPropertySelectionRecords, setWdPropertySelectionRecords] = useState<WdPropertySelectionRecord[]>([]);

    const addWdPropertySelectionRecord = useCallback((newRecord: WdPropertySelectionRecord): boolean => {
        if (!isWdPropertySelectionRecordPresent(newRecord, wdPropertySelectionRecords)) {
            setWdPropertySelectionRecords([...wdPropertySelectionRecords, newRecord]);
            return true;
        }
        return false;
    }, [wdPropertySelectionRecords]);
    
    const removeWdPropertySelectionRecord = useCallback((record: WdPropertySelectionRecord) => {
        setWdPropertySelectionRecords([...(wdPropertySelectionRecords.filter((e) => e.id !== record.id))]);    
    }, [wdPropertySelectionRecords]);

    const changeWdPropertySelectionRecord = useCallback((id: number, subjectWdClass: WdClassHierarchyDescOnly, objectWdClass: WdClassHierarchyDescOnly | undefined): boolean => {
        const indexOf = findIndexOfWdPropertySelectionRecord(id, wdPropertySelectionRecords);
        const record = wdPropertySelectionRecords[indexOf];
        const editedCopy = WdPropertySelectionRecord.createEditedCopy(record, subjectWdClass, objectWdClass);
        if (isWdPropertySelectionRecordPresent(editedCopy, wdPropertySelectionRecords)) {
            return false;
        } else {
            wdPropertySelectionRecords[indexOf] = editedCopy;
            setWdPropertySelectionRecords([...wdPropertySelectionRecords]);
            return true;   
        }
    }, [wdPropertySelectionRecords]);

    const propertySelectionContextValue = useMemo((): WdPropertySelectionContextValue => {
        return {
            wdPropertySelectionRecords,
            addWdPropertySelectionRecord,
            removeWdPropertySelectionRecord,
            changeWdPropertySelectionRecord,
        }
    }, [addWdPropertySelectionRecord, changeWdPropertySelectionRecord, removeWdPropertySelectionRecord, wdPropertySelectionRecords]);

    return propertySelectionContextValue;
}