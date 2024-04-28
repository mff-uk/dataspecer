import { createContext } from "react";
import { PropertySelectionRecord } from "../property-selection-record";

export interface PropertySelectionContextValue {
    propertySelectionRecords: PropertySelectionRecord[];
    addPropertySelectionRecord: (newRecord: PropertySelectionRecord) => void;
    removePropertySelectionRecord: (record: PropertySelectionRecord) => void;
}

export const PropertySelectionContext = createContext<PropertySelectionContextValue | undefined>(undefined);
