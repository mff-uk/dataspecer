import React, { useContext, useEffect, useState, useCallback, type ReactNode } from "react";

export type QueryParamsContextType = {
    packageId: string | null;
    viewId: string | null;
    updatePackageId: (p: string | null) => void;
    updateViewId: (v: string | null) => void;
};

export const QueryParamsContext = React.createContext<QueryParamsContextType>(
    null as unknown as QueryParamsContextType
);

const PACKAGE_ID = "package-id";

const VIEW_ID = "view-id";

export const QueryParamsProvider = (props: { children: ReactNode }) => {

    const searchParams = new URLSearchParams(window.location.search);

    const [packageId, setPackageId] = useState<string | null>(searchParams.get(PACKAGE_ID));
    const [viewId, setViewId] = useState<string | null>(searchParams.get(VIEW_ID));

    useEffect(() => {
        const initialPackageId = searchParams.get(PACKAGE_ID);
        const initialViewId = searchParams.get(VIEW_ID);
        setPackageId(initialPackageId ?? null);
        setViewId(initialViewId ?? null);
    }, [searchParams]);

    const setQueryParams = useCallback(
        (params: Partial<{ [PACKAGE_ID]: string | null; [VIEW_ID]: string | null }>) => {
            const stateAsParams: Record<string, string> = {};
            if (packageId != null) {
                stateAsParams[PACKAGE_ID] = packageId;
            }
            if (viewId != null) {
                stateAsParams[VIEW_ID] = viewId;
            }
            const urlSearchParams = new URLSearchParams(stateAsParams);
            Object.entries(params).forEach(([key, value]) => {
                if (value === undefined || value === null) {
                    urlSearchParams.delete(key);
                } else {
                    urlSearchParams.set(key, String(value));
                }
            });
            // TODO We need to change URL here!
            // const search = urlSearchParams.toString();
            // const query = search ? `?${search}` : "";
            // router.replace(`${pathname}${query}`);
        },
        [/*pathname, router,*/ packageId, viewId]
    );

    const updatePackageId = (pId: string | null) => {
        setPackageId(pId);
        setQueryParams({ [PACKAGE_ID]: pId });
    };

    const updateViewId = (vId: string | null) => {
        setViewId(vId);
        setQueryParams({ [VIEW_ID]: vId });
    };

    return (
        <QueryParamsContext.Provider value={{ packageId, viewId, updatePackageId, updateViewId }}>
            {props.children}
        </QueryParamsContext.Provider>
    );
};

/**
 * provides functionality to work with query parameters
 */
export const useQueryParamsContext = (): QueryParamsContextType => {
    const context = useContext(QueryParamsContext);
    if (context === undefined) {
        throw new Error("useQueryParams must be used within a QueryParamsProvider");
    }
    return context;
};
