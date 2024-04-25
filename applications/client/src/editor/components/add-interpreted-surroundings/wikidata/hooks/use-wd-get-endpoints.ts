import { WdBaseOrInheritOrder, WdClassHierarchyDescOnly, WdClassPropertyEndpoints, WdDomainsOrRanges, WdEntityId, isWdErrorResponse } from "@dataspecer/wikidata-experimental-adapter"
import { useContext } from "react";
import { useQuery } from "react-query";
import { WikidataAdapterContext } from "../contexts/wikidata-adapter-context";

export interface UseWdGetEndpointsReturnValue {
    wdEndpoints: WdClassHierarchyDescOnly[] | undefined;
    isLoading: boolean;
    isError: boolean;
} 

export function useWdGetEndpoints(wdClassId: WdEntityId, wdPropertyId: WdEntityId, domainsOrRanges: WdDomainsOrRanges, ownOrInherited: WdBaseOrInheritOrder): UseWdGetEndpointsReturnValue {
    const adapterContext = useContext(WikidataAdapterContext);
    const {data, isError, isLoading} = useQuery(['endpoints', wdClassId.toString(), wdPropertyId.toString(), domainsOrRanges, ownOrInherited ], async () => {
            return await adapterContext.wdAdapter.connector.getClassPropertyEndpoints(wdClassId, wdPropertyId, domainsOrRanges, ownOrInherited);
    });
  
    const queryFailed = !isLoading && (isError || isWdErrorResponse(data));
    const endpoints = (!isLoading && !queryFailed ? (data as WdClassPropertyEndpoints).classes : undefined)

    return {
        wdEndpoints: endpoints,
        isLoading: isLoading,
        isError: queryFailed,
    }
}