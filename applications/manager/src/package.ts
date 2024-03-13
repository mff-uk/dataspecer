import { useEffect, useState } from "react";

export const usePackage = () => {
    const [state, setState] = useState({
        isLoading: true,
        packages: [],
    });

    useEffect(() => {
        (async () => {
            const result = await fetch("https://backend.dataspecer.com/package-list");
            const data = await result.json();

            const transformed = data.map((item: any) => ({
                type:  item.providesSemanticModel ? "ds" : "folder",
                name: item.name.cs,
                tags: [],
                children: [],
                id: item.id,
            }));

            setState({
                isLoading: false,
                packages: transformed,
            });
        })();
    }, []);

    return state;
};