import {DependencyList, useEffect, useState} from "react";

export const useAsyncMemo = <T>(factory: () => Promise<T>, deps: DependencyList, initial?: T): [T | undefined, boolean] => {
    const [state, setState] = useState<[T | undefined, boolean]>([initial, true]);

    useEffect(() => {
        let cancel = false;
        setState([state[0], true]);
        factory().then(val => {
            if (!cancel) {
                setState([val, false]);
            }
        })

        return () => {
            cancel = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps); // factory depends on deps; state is updated only from the useEffect, therefore it is not included in deps

    return state;
}
