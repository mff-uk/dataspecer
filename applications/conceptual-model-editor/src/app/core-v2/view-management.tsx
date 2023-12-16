import { useMemo, useState } from "react";
import { useBackendConnection } from "./backend-connection";
import { usePackageSearch } from "./util/package-search";
import { useViewContext } from "./context/view-context";
import { getNameOf, getOneNameFromLanguageString } from "./util/utils";
import { useClassesContext } from "./context/classes-context";
import { useModelGraphContext } from "./context/graph-context";
import { VisualEntityModel, VisualEntityModelImpl } from "@dataspecer/core-v2/visual-model";

export const ViewManagement = () => {
    // const { viewLayouts } = useViewContext();
    // const { activeViewId, setActiveViewId } = useViewContext();
    const { aggregatorView, aggregator, setAggregatorView } = useModelGraphContext();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const activeViewId = aggregatorView.getActiveViewId();
    const availableViews = aggregatorView.getAvailableViews();

    const setActiveViewId = (viewId: string) => {
        aggregatorView.changeVisualView(viewId);
    };

    const handleViewSelected = (viewId: string) => {
        setActiveViewId(viewId);
        setAggregatorView(aggregator.getView());
        console.log("selected view with id: ", viewId);
        toggleDropdown();
    };

    const handleCreateNewView = () => {
        const model = new VisualEntityModelImpl();
        aggregator.addVisualModel(model);
        setAggregatorView(aggregator.getView());
        // setVisualModels((prev) => new Map(prev.set(model.id, model)));
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
                    <button
                        className="white ml-2 text-[15px]"
                        onClick={handleCreateNewView}
                        title="create a new diagram"
                    >
                        🖼️
                    </button>
                </div>
                {dropdownOpen && (
                    <ul className="absolute z-10 mt-8 flex flex-col bg-[#5438dc]">
                        {availableViews.map((viewId) => (
                            <li key={viewId} className="w-full">
                                <button onClick={() => handleViewSelected(viewId)}>{viewId}</button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};
