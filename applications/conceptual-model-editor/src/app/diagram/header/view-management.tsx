import { useEffect } from "react";
import { useModelGraphContext } from "../context/model-context";
import { DropDownCatalog } from "../components/management/dropdown-catalog";
import { useQueryParamsContext } from "../context/query-params-context";
import { createWritableVisualModel } from "../util/visual-model-utils";

export const ViewManagement = () => {
    const {
        aggregatorView,
        aggregator,
        setAggregatorView,
        addVisualModel: addVisualModelToGraph,
        visualModels,
        removeVisualModel: removeVisualModelFromModels,
    } = useModelGraphContext();

    const { viewId, updateViewId: setViewIdSearchParam } = useQueryParamsContext();

    const activeViewId = aggregatorView.getActiveViewId();
    const availableVisualModelIds = aggregatorView.getAvailableVisualModels().map(m => [m.getId(), m.getLabel()?.["en"]] as [string, string]);

    useEffect(() => {
        if (activeViewId === undefined) {
            console.log("Ignore change in activeViewId as it is null.");
            return;
        }
        setViewIdSearchParam(activeViewId ?? null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeViewId]);

    const setActiveViewId = (modelId: string) => {
        aggregatorView.changeActiveVisualModel(modelId);
    };

    const handleViewSelected = (viewId: string) => {
        setActiveViewId(viewId);
        setAggregatorView(aggregator.getView());
        setViewIdSearchParam(activeViewId ?? null);
    };

    const handleCreateNewView = () => {
        // FIXME: workaround for having the same color for different views, better to have model colors in a package config or sth
        const activeVisualModel = aggregatorView.getActiveVisualModel();
        const model = createWritableVisualModel();
        if (activeVisualModel) {
            for (const [identifier, data] of activeVisualModel.getModelsData()) {
                model.setModelColor(identifier, data.color ?? "white");
            }
        }
        addVisualModelToGraph(model);
        aggregatorView.changeActiveVisualModel(model.getId());
        setAggregatorView(aggregator.getView());
        setViewIdSearchParam(activeViewId ?? null);
    };

    const handleViewDeleted = (viewId: string) => {
        const visualModel = visualModels.get(viewId);
        if (!visualModel) {
            return;
        }
        removeVisualModelFromModels(viewId);
    };

    return (
        <DropDownCatalog
            catalogName="view"
            valueSelected={viewId}
            openCatalogTitle="change view"
            availableValues={availableVisualModelIds}
            onValueSelected={(value) => handleViewSelected(value)}
            onValueDeleted={(value) => handleViewDeleted(value)}
        >
            <button className="white ml-2 text-[15px]" onClick={handleCreateNewView} title="create a new view">
                <span className="font-bold">+</span>🖼️
            </button>
        </DropDownCatalog>
    );
};
