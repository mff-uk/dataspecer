import { useEffect, useState } from "react";
import { useModelGraphContext } from "../context/model-context";
import { VisualEntityModelImpl } from "@dataspecer/core-v2/visual-model";
import { useViewParam } from "../util/view-param";

export const ViewManagement = () => {
    const { aggregatorView, aggregator, setAggregatorView, addVisualModelToGraph } = useModelGraphContext();
    const { visualModels } = useModelGraphContext();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const { viewId, setViedIdSearchParam } = useViewParam();

    const activeViewId = aggregatorView.getActiveViewId();
    const availableVisualModelIds = aggregatorView.getAvailableVisualModelIds();

    useEffect(() => {
        if (!activeViewId) {
            console.log("setting activeViewId to null");
        }
        setViedIdSearchParam(activeViewId ?? null);
    }, [activeViewId]);

    const setActiveViewId = (modelId: string) => {
        aggregatorView.changeActiveVisualModel(modelId);
    };

    const handleViewSelected = (viewId: string) => {
        setActiveViewId(viewId);
        setAggregatorView(aggregator.getView());
        setViedIdSearchParam(activeViewId ?? null);
        toggleDropdown();
    };

    const handleCreateNewView = () => {
        // FIXME: workaround for having the same color for different views
        const activeVisualModel = aggregatorView.getActiveVisualModel();
        const model = new VisualEntityModelImpl(undefined);
        if (activeVisualModel) {
            for (const [mId, mColor] of activeVisualModel?.getModelColorPairs()) {
                model.setColor(mId, mColor);
            }
        }
        addVisualModelToGraph(model);
        aggregatorView.changeActiveVisualModel(model.getId());
        setAggregatorView(aggregator.getView());
        setViedIdSearchParam(activeViewId ?? null);
    };

    const handleViewDeleted = (viewId: string) => {
        const visualModel = visualModels.get(viewId);
        if (!visualModel) {
            return;
        }
        aggregator.deleteModel(visualModel);
        toggleDropdown();
        setAggregatorView(aggregator.getView());
    };

    const toggleDropdown = () => {
        setDropdownOpen((prev) => !prev);
    };

    return (
        <div className="my-auto">
            <div className="flex flex-col text-[15px]">
                <div className="relative flex flex-row">
                    <div>
                        view:<span className="ml-2 font-mono">{viewId ?? "---"}</span>
                    </div>
                    <button className="white ml-2 text-[15px]" title="change view" onClick={toggleDropdown}>
                        🗃️
                    </button>
                    <button className="white ml-2 text-[15px]" onClick={handleCreateNewView} title="create a new view">
                        <span className="font-bold">+</span>🖼️
                    </button>
                    {dropdownOpen && (
                        <ul className="absolute z-10 mt-8 flex w-full flex-col bg-[#5438dc]">
                            {availableVisualModelIds.map((vId) => (
                                <li key={vId} className="flex w-full flex-row justify-between">
                                    <button className="flex-grow" onClick={() => handleViewSelected(vId)}>
                                        {vId}
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleViewDeleted(vId);
                                        }}
                                    >
                                        🗑
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};
