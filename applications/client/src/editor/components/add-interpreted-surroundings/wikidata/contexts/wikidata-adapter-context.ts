import { IriProvider } from "@dataspecer/core/cim/iri-provider";
import { WikidataAdapter } from "@dataspecer/wikidata-experimental-adapter";
import { createContext } from "react";

export interface WikidataAdapterContextValue {
    iriProvider: IriProvider;
    wdAdapter: WikidataAdapter;
}

export const WikidataAdapterContext = createContext<WikidataAdapterContextValue | undefined>(
    undefined,
);
