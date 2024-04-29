import { createContext } from "react";
import { WdPropertySelectionRecord } from "../property-selection-record";
import { WdClassHierarchyDescOnly } from "@dataspecer/wikidata-experimental-adapter";

export interface WdPropertySelectionContextValue {
    wdPropertySelectionRecords: WdPropertySelectionRecord[];
    addWdPropertySelectionRecord: (newRecord: WdPropertySelectionRecord) => void;
    removeWdPropertySelectionRecord: (record: WdPropertySelectionRecord) => void;
    changeWdPropertySelectionRecord: (id: number, subjectWdClass: WdClassHierarchyDescOnly, objectWdClass: WdClassHierarchyDescOnly | undefined) => void;
}

export const WdPropertySelectionContext = createContext<WdPropertySelectionContextValue | undefined>(undefined);
