import { WdFilterByInstance } from "@dataspecer/wikidata-experimental-adapter";
import { createContext } from "react";

export const WdFilterByInstanceContext = createContext<WdFilterByInstance | undefined>(undefined);
