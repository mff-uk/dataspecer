import {useCallback} from "react";
import {useStateWithMutableInitial} from "./use-state-with-mutable-initial";

// https://github.com/opendata-mvcr/mission-control/blob/main/src/hooks/useToggle.ts

export const useToggle = (initialValue: boolean = false) => {
    const [isOpen, setOpen] = useStateWithMutableInitial(initialValue);

    const open = useCallback(() => {
        setOpen(true);
    }, [setOpen]);

    const close = useCallback(() => {
        setOpen(false);
    }, [setOpen]);

    return {
        isOpen,
        open,
        close,
    };
};
