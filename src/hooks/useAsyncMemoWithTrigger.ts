import {DependencyList, useEffect, useState} from "react";

/**
 * This hook works just like {@link useAsyncMemo} but it returns reload function as a third parameter which can be used
 * to force re-run the function to obtain new data
 * @param factory Asynchronous method that constructs the result.
 * @param deps Dependency array. If any of the array is changed, the factory method is called again.
 * @param initial Initial value.
 * @return First item is the obtained value, second is whether the value is still being loaded and the third value
 *     contains the reload function
 */
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
