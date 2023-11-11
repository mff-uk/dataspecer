import { useMemo } from "react";
import { useQueryParams } from "./query-params";

export const usePackageSearch = () => {
    const { queryParams, setQueryParams } = useQueryParams();

    const packageId = useMemo(() => queryParams.get("package-id"), [queryParams]);

    const setPackage = (pckgId: string) => {
        setQueryParams({ "package-id": pckgId });
    };

    return { packageId, setPackage };
};
