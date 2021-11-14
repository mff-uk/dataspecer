import React, {memo} from "react";
import {useAsyncMemoWithTrigger} from "../../use-async-memo-with-trigger";
import axios from "axios";

export const StoreSize: React.FC<{ storeId: string | null, children: (operations: number | null, resources: number | null) => React.ReactElement }> = memo(({storeId, children}) => {
    const [data] = useAsyncMemoWithTrigger(async () => (storeId === null ? null : axios.get(`${process.env.REACT_APP_BACKEND}/store/${storeId}`)), [storeId]);
    return children(data?.data?.operations?.length ?? null, data?.data?.resources ? (Object.keys(data?.data?.resources).length ?? null) : null);
});
