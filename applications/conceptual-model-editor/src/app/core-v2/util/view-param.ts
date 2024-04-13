import { useEffect, useState } from "react";
import { useQueryParams } from "./query-params";

const VIEW_ID = "view-id";

export const useViewParam = () => {
    const { queryParams, setQueryParams } = useQueryParams();
    const [viewId, setViewId] = useState<string | null>(queryParams.get(VIEW_ID));

    useEffect(() => {
        const vId = queryParams.get(VIEW_ID);
        if (vId && vId != viewId) {
            setViewId(vId);
            console.log(`view-param: setting view-viewId:'${vId}'`);
        }
    }, [queryParams]);

    const setViedIdSearchParam = (vId: string | null) => {
        setQueryParams({ [VIEW_ID]: vId });
    };

    return { viewId, setViedIdSearchParam };
};
