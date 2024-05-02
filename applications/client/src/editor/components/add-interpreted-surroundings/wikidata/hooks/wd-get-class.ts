import { WdClassDescOnly, WdClassWithSurroundingsDesc, isWdErrorResponse } from "@dataspecer/wikidata-experimental-adapter";
import { useContext } from "react";
import { useQuery } from "react-query";
import { WikidataAdapterContext } from "../contexts/wikidata-adapter-context";

export interface UseWdGetClassReturnValue {
    wdClassWithSurroundings: WdClassWithSurroundingsDesc | undefined;
    isLoading: boolean;
    isError: boolean;
}

export function useWdGetClass(wdClass: WdClassDescOnly): UseWdGetClassReturnValue {
    const adapterContext = useContext(WikidataAdapterContext);
    const { data, isError, isLoading } = useQuery([ "class", wdClass.iri], async () => {
            return await adapterContext.wdAdapter.wdOntologyConnector.getClass(wdClass.id);
        },
    );

    const queryFailed = !isLoading && (isError || isWdErrorResponse(data));
    const endpoints =
        !isLoading && !queryFailed ? (data as WdClassWithSurroundingsDesc) : undefined;

    return {
        wdClassWithSurroundings: endpoints,
        isLoading: isLoading,
        isError: queryFailed,
    };
}
