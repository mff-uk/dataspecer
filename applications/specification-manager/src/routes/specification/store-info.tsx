import React, {memo} from "react";
import {useAsyncMemoWithTrigger} from "../../use-async-memo-with-trigger";
import axios from "axios";
import {processEnv} from "../../index";

export const StoreInfo: React.FC<{ storeId: string | null, children: (name: string | null, operations: number | null, resources: number | null) => React.ReactElement }> = memo(({storeId, children}) => {
    const [data] = useAsyncMemoWithTrigger(async () => (storeId === null ? null : axios.get(`${processEnv.REACT_APP_BACKEND}/store/${storeId}`)), [storeId]);
    const schema: any = Object.values(data?.data?.resources ?? {}).find((resource: any) => resource?.types?.includes('https://ofn.gov.cz/slovník/psm/Schema'));
    const name = schema?.dataPsmHumanLabel?.['en'] ?? schema?.dataPsmHumanLabel?.['cs'];
    return children(name ?? null, data?.data?.operations?.length ?? null, data?.data?.resources ? (Object.keys(data?.data?.resources).length ?? null) : null);
});
