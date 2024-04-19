import { WdClassSurroundings, WdEntityId, isWdErrorResponse } from "@dataspecer/wikidata-experimental-adapter"
import { useContext } from "react";
import { useQuery } from "react-query";
import { WikidataAdapterContext } from "../contexts/wikidata-adapter-context";

export interface UseWdGetSurroundingsReturnValue {
    wdClassSurroundings: WdClassSurroundings | null;
    isLoading: boolean;
    isError: boolean;
} 

export function useWdGetSurroundings(wdClassId: WdEntityId): UseWdGetSurroundingsReturnValue {
    const adapterContext = useContext(WikidataAdapterContext);
    const {data, isError, isLoading} = useQuery(['surroundings', wdClassId.toString()], async () => {
            return await adapterContext.wdAdapter.connector.getClassSurroundings(wdClassId);
    });
  
    const queryFailed = !isLoading && (isError || isWdErrorResponse(data));
    
    return {
        wdClassSurroundings: (!isLoading && !queryFailed ? data as WdClassSurroundings : null),
        isLoading: isLoading,
        isError: queryFailed,
    }
}