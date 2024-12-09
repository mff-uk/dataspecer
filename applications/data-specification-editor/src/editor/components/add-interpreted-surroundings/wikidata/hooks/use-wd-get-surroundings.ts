import {
    WdClassSurroundings,
    WdEntityId,
    isWdErrorResponse,
} from "@dataspecer/wikidata-experimental-adapter";
import { useContext } from "react";
import { useQuery } from "react-query";
import { WikidataAdapterContext } from "../../../wikidata/wikidata-adapter-context";

export interface UseWdGetSurroundingsReturnValue {
    wdClassSurroundings: WdClassSurroundings | undefined;
    isLoading: boolean;
    isError: boolean;
}

export function useWdGetSurroundings(wdClassId: WdEntityId): UseWdGetSurroundingsReturnValue {
    const adapterContext = useContext(WikidataAdapterContext);
    const { data, isError, isLoading } = useQuery(
        ["surroundings", wdClassId.toString()],
        async () => {
            return await adapterContext.wdAdapter.wdOntologyConnector.getClassSurroundings(wdClassId);
        },
    );

    const queryFailed = !isLoading && (isError || isWdErrorResponse(data));
    const surroundings = !isLoading && !queryFailed ? (data as WdClassSurroundings) : undefined;

    return {
        wdClassSurroundings: surroundings,
        isLoading: isLoading,
        isError: queryFailed,
    };
}
