import { type ReactNode, useEffect, useRef, useState } from "react";

const CatalogItem = (props: { value: string; onValueSelected: () => void; withDeleteButton?: () => void }) => {
    const { value, onValueSelected, withDeleteButton } = props;
    return (
        <li key={value} className="flex w-full flex-row justify-between">
            <button id={`button-dropdown-catalog-${value}`} className="flex-grow" onClick={onValueSelected}>
                {value}
            </button>
            {withDeleteButton && (
                <button id={`button-dropdown-catalog-${value}-delete`} onClick={withDeleteButton}>
                    🗑
                </button>
            )}
        </li>
    );
};

export const DropDownCatalog = (props: {
    catalogName: string;
    valueSelected: string | null;
    availableValues: readonly string[];
    openCatalogTitle?: string;
    onValueSelected: (value: string) => void;
    onValueDeleted?: (value: string) => void;
    children?: ReactNode;
}) => {
    const { catalogName, valueSelected, availableValues, openCatalogTitle, onValueSelected, onValueDeleted, children } =
        props;
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (dropdownOpen && dropdownRef.current) {
            dropdownRef.current?.focus();
        }
    }, [dropdownOpen]);

    return (
        <div className="my-auto">
            <div className="flex flex-col text-[15px]">
                <div className="relative flex flex-row">
                    <div className="text-nowrap">
                        {catalogName}:
                        <span className="ml-2 max-w-40 overflow-x-clip  font-mono">{valueSelected ?? "---"}</span>
                    </div>
                    <button
                        className="white ml-2 text-[15px]"
                        title={openCatalogTitle}
                        onClick={() => setDropdownOpen(true)}
                    >
                        🗃️
                    </button>
                    {children}
                    {dropdownOpen && (
                        <div
                            ref={dropdownRef}
                            tabIndex={-1}
                            className="absolute z-10 mt-8 flex w-full flex-col bg-[#5438dc]"
                            onBlur={(e) => {
                                if (e.relatedTarget?.id.startsWith("button-dropdown-catalog-")) {
                                    return;
                                }
                                setDropdownOpen(false);
                                console.log(e);
                                e.stopPropagation();
                            }}
                        >
                            <ul className="w-full">
                                {availableValues.map((value) => (
                                    <CatalogItem
                                        key={value}
                                        value={value}
                                        onValueSelected={() => {
                                            setDropdownOpen(false);
                                            onValueSelected(value);
                                        }}
                                        withDeleteButton={
                                            onValueDeleted
                                                ? () => {
                                                      setDropdownOpen(false);
                                                      onValueDeleted(value);
                                                  }
                                                : undefined
                                        }
                                    />
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
