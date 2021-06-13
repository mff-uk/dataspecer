import {useCallback, useState} from "react";

// https://github.com/opendata-mvcr/mission-control/blob/main/src/hooks/useToggle.ts

export const useToggle = (initialValue: boolean = false) => {
    const [isOpen, setOpen] = useState(initialValue);

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
}