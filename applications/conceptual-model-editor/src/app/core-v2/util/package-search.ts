import { useEffect, useState } from "react";
import { useQueryParams } from "./query-params";

const PACKAGE_ID = "package-id";

export const usePackageSearch = () => {
    const { queryParams, setQueryParams } = useQueryParams();
    const [packageId, setPackageId] = useState<string>();

    const changePackageId = () => {
        const pId = queryParams.get(PACKAGE_ID);
        if (pId && pId != packageId) {
            setPackageId(pId);
            console.log(`package-search: setting a new package id pid:'${pId}', packageId:'${packageId}'`);
        }
        if (!pId) {
            setPackageId(undefined);
            console.log("package-search: no packageId");
        }
    };

    useEffect(() => {
        changePackageId();
    }, [queryParams]);

    const setPackage = (pckgId: string | null) => {
        setQueryParams({ [PACKAGE_ID]: pckgId });
    };

    const getPackageId = () => {
        return queryParams.get(PACKAGE_ID);
    };

    return { packageId, setPackage, getPackageId };
};
