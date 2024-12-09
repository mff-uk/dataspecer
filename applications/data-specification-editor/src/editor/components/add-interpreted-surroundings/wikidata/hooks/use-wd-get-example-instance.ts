import {
    WdClassDescOnly,
    isWdErrorResponse,
} from "@dataspecer/wikidata-experimental-adapter";
import { useContext } from "react";
import { useQuery } from "react-query";
import { WikidataAdapterContext } from "../../../wikidata/wikidata-adapter-context";
import { WdExampleInstance } from "@dataspecer/wikidata-experimental-adapter/lib/wikidata-sparql-endpoint-connector/api-types/get-example-instances";

export interface UseWdGetExampleInstancesReturnValue {
    exampleWdInstances: WdExampleInstance[] | undefined;
    isLoading: boolean;
    isError: boolean;
}

export function useWdGetExampleInstances(wdClass: WdClassDescOnly): UseWdGetExampleInstancesReturnValue {
    const adapterContext = useContext(WikidataAdapterContext);
    const { data, isError, isLoading } = useQuery(
        ["exampleInstances", wdClass.iri],
        async () => {
            return await adapterContext.wdAdapter.wdSparqlEndpointConnector.getExampleInstances(wdClass);
        },
    );

    const queryFailed = !isLoading && (isError || isWdErrorResponse(data));
    const surroundings = !isLoading && !queryFailed ? (data as WdExampleInstance[]) : undefined;

    return {
        exampleWdInstances: surroundings,
        isLoading: isLoading,
        isError: queryFailed,
    };
}
