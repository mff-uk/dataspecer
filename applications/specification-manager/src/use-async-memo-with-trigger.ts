import {DependencyList, useEffect, useState} from "react";

export const useAsyncMemoWithTrigger = <T>(factory: () => Promise<T>, deps: DependencyList, initial?: T): [T | undefined, boolean, (() => void) | undefined] => {
    const [state, setState] = useState<[T | undefined, boolean, (() => void) | undefined]>([initial, true, undefined]);

    useEffect(() => {
        let cancel = false;
        let currState = state[0];
        const reloadMethod = () => {
            setState([currState, true, reloadMethod]);
            factory().then(val => {
                if (!cancel) {
                    setState([val, false, reloadMethod]);
                    currState = val;
                }
            })
        };
        reloadMethod();
        return () => {
            cancel = true;
        };
    }, deps);

    return state;
}
