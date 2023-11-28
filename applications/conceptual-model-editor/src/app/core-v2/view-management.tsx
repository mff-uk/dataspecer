import { useMemo, useState } from "react";
import { useBackendConnection } from "./backend-connection";
import { usePackageSearch } from "./util/package-search";
import { useViewContext } from "./context/view-context";
import { getNameOf, getOneNameFromLanguageString } from "./util/utils";

export const ViewManagement = () => {
    const { viewLayouts } = useViewContext();
    const { activeViewId, setActiveViewId } = useViewContext();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleViewSelected = (viewId: string) => {
        setActiveViewId(viewId);
        console.log("selected view with id: ", viewId);
        toggleDropdown();
    };

    const toggleDropdown = () => {
        setDropdownOpen((prev) => !prev);
    };

    return (
        <div className="my-auto">
            <div className="flex flex-col text-[15px]">
                <div className="flex flex-row">
                    <div>
                        view:<span className="ml-2 font-mono">{activeViewId}</span>
                    </div>
                    <button className="white ml-2 text-[15px]" onClick={toggleDropdown}>
                        👁️
                    </button>
                </div>
                {dropdownOpen && (
                    <ul className="absolute z-10 mt-8 flex flex-col bg-[#5438dc]">
                        {viewLayouts.map((viewLayout) => (
                            <li key={viewLayout.id} className="w-full">
                                <button onClick={() => handleViewSelected(viewLayout.id)}>
                                    {getOneNameFromLanguageString(viewLayout.name)}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};
