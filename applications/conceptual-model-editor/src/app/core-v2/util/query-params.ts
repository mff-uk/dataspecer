"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export const useQueryParams = <T>() => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const urlSearchParams = new URLSearchParams(searchParams?.toString());

    const setQueryParams = (params: Partial<T>) => {
        console.log(
            "query-params: setting query params",
            params,
            [...searchParams.keys()],
            [...urlSearchParams.keys()]
        );
        Object.entries(params).forEach(([key, value]) => {
            if (value === undefined || value === null) {
                urlSearchParams.delete(key);
                console.log("query-params: deleting key", key, [...urlSearchParams.keys()]);
            } else {
                urlSearchParams.set(key, String(value));
                console.log("query-params: adding key", key, value, [...urlSearchParams.entries()]);
            }
        });
        console.log("query-params: after setting", [...urlSearchParams.keys()]);
        const search = urlSearchParams.toString();
        const query = search ? `?${search}` : "";
        // replace since we don't want to build a history
        router.replace(`${pathname}${query}`);
    };

    const clearQueryParams = () => {
        router.replace(pathname, undefined);
    };

    return { queryParams: searchParams, setQueryParams, clearQueryParams };
};
