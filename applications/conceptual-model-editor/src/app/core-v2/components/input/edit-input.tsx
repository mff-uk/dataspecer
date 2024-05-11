import { useState } from "react";

export const useEditInput = () => {
    const [isEditInputActive, setIsEditInputActive] = useState(false);
    const [defaultValue, setDefaultValue] = useState<string | undefined>(undefined);
    const [placeholder, setPlaceholder] = useState<string | undefined>(undefined);
    const [onSave, setOnSave] = useState<(val: string | null) => void | undefined>();

    const openEditInput = (
        onSave: (val: string | null) => void,
        defaultValue: string | undefined,
        placeholder: string
    ) => {
        setIsEditInputActive(true);
        setOnSave(() => (val: string | null) => onSave(val));
        setDefaultValue(defaultValue);
        setPlaceholder(placeholder);
    };

    const reset = () => {
        setIsEditInputActive(false);
        setOnSave(undefined);
        setDefaultValue(undefined);
        setPlaceholder(undefined);
    };

    const EditInput = () => {
        const [value, setValue] = useState(defaultValue);

        return (
            <div className="flex-grow">
                <input
                    className="w-full"
                    autoFocus
                    onFocus={(e) => e.target.select()}
                    value={value}
                    placeholder={placeholder}
                    onChange={(e) => {
                        setValue(e.target.value);
                    }}
                    onBlur={() => {
                        onSave?.(value ?? null);
                        reset();
                    }}
                    onKeyUp={(e) => {
                        if (e.key === "Enter") {
                            onSave?.(value ?? null);
                            reset();
                        }
                        if (e.key === "Escape") {
                            reset();
                        }
                    }}
                />
            </div>
        );
    };

    return {
        EditInput,
        isEditInputActive,
        openEditInput,
    };
};
