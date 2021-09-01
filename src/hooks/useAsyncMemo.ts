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
    }, deps);

    return state;
}
