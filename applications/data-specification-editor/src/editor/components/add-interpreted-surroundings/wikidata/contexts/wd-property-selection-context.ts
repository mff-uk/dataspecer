import { createContext } from "react";
import { WdPropertySelectionRecord } from "../property-selection-record/property-selection-record";
import { WdClassHierarchyDescOnly } from "@dataspecer/wikidata-experimental-adapter";

export interface WdPropertySelectionContextValue {
    wdPropertySelectionRecords: WdPropertySelectionRecord[];
    addWdPropertySelectionRecord: (newRecord: WdPropertySelectionRecord) => boolean;
    removeWdPropertySelectionRecord: (record: WdPropertySelectionRecord) => void;
    changeWdPropertySelectionRecord: (id: number, subjectWdClass: WdClassHierarchyDescOnly, objectWdClass: WdClassHierarchyDescOnly | undefined) => boolean;
}

export const WdPropertySelectionContext = createContext<WdPropertySelectionContextValue | undefined>(undefined);
