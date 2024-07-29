import { useEffect } from "react";
import { VisualEntityModelImpl } from "@dataspecer/core-v2/visual-model";
import { useModelGraphContext } from "../context/model-context";
import { DropDownCatalog } from "../components/management/dropdown-catalog";
import { useQueryParamsContext } from "../context/query-params-context";

export const ViewManagement = () => {
    const {
        aggregatorView,
        aggregator,
        setAggregatorView,
        addVisualModelToGraph,
        visualModels,
        removeVisualModelFromModels,
    } = useModelGraphContext();

    const { viewId, updateViewId: setViewIdSearchParam } = useQueryParamsContext();

    const activeViewId = aggregatorView.getActiveViewId();
    const availableVisualModelIds = aggregatorView.getAvailableVisualModels().map(m => [m.getId(), m.modelAlias] as [string, string]);

    useEffect(() => {
        if (!activeViewId) {
            console.log("setting activeViewId to null");
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
        const model = new VisualEntityModelImpl(undefined);
        if (activeVisualModel) {
            for (const [mId, mColor] of activeVisualModel.getModelColorPairs()) {
                model.setColor(mId, mColor);
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
