import { WdClassHierarchyDescOnly } from "@dataspecer/wikidata-experimental-adapter";
import { useState, useMemo, useCallback } from "react";
import { WdPropertySelectionContextValue } from "../contexts/wd-property-selection-context";
import { WdPropertySelectionRecord, findIndexOfWdPropertySelectionRecord } from "../property-selection-record";

export function useWdPropertySelection() {
    const [wdPropertySelectionRecords, setWdPropertySelectionRecords] = useState<WdPropertySelectionRecord[]>([]);

    const addWdPropertySelectionRecord = useCallback((newRecord: WdPropertySelectionRecord) => {
        setWdPropertySelectionRecords([...wdPropertySelectionRecords, newRecord]);
    }, [wdPropertySelectionRecords]);
    
    const removeWdPropertySelectionRecord = useCallback((record: WdPropertySelectionRecord) => {
        setWdPropertySelectionRecords([...(wdPropertySelectionRecords.filter((e) => e.id !== record.id))]);    
    }, [wdPropertySelectionRecords]);

    const changeWdPropertySelectionRecord = useCallback((id: number, subjectWdClass: WdClassHierarchyDescOnly, objectWdClass: WdClassHierarchyDescOnly | undefined) => {
        const indexOf = findIndexOfWdPropertySelectionRecord(id, wdPropertySelectionRecords);
        if (indexOf !== -1) {
            const record = wdPropertySelectionRecords[indexOf];
            const editedCopy = WdPropertySelectionRecord.createEditedCopy(record, subjectWdClass, objectWdClass);
            wdPropertySelectionRecords[indexOf] = editedCopy;
            setWdPropertySelectionRecords([...wdPropertySelectionRecords]);
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