import { WdPropertyDescOnly, WdPropertyWithSurroundingDesc, isWdErrorResponse } from "@dataspecer/wikidata-experimental-adapter";
import { useContext } from "react";
import { useQuery } from "react-query";
import { WikidataAdapterContext } from "../contexts/wikidata-adapter-context";

export interface UseWdGetPropertyReturnValue {
    wdPropertyWithSurroundings: WdPropertyWithSurroundingDesc | undefined;
    isLoading: boolean;
    isError: boolean;
}

export function useWdGetProperty(wdProperty: WdPropertyDescOnly): UseWdGetPropertyReturnValue {
    const adapterContext = useContext(WikidataAdapterContext);
    const { data, isError, isLoading } = useQuery([ "property", wdProperty.iri], async () => {
            return await adapterContext.wdAdapter.wdOntologyConnector.getProperty(wdProperty.id);
        },
    );

    const queryFailed = !isLoading && (isError || isWdErrorResponse(data));
    const endpoints =
        !isLoading && !queryFailed ? (data as WdPropertyWithSurroundingDesc) : undefined;

    return {
        wdPropertyWithSurroundings: endpoints,
        isLoading: isLoading,
        isError: queryFailed,
    };
}
