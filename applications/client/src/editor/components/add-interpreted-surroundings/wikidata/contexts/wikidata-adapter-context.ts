import { IriProvider } from "@dataspecer/core/cim/iri-provider";
import { WikidataAdapter } from "@dataspecer/wikidata-experimental-adapter";
import { createContext } from "react";

export const WikidataAdapterContext = createContext<{iriProvider: IriProvider, wdAdapter: WikidataAdapter} | undefined>(undefined);