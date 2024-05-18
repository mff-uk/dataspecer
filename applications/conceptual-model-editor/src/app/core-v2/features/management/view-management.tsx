import { useEffect } from "react";
import { VisualEntityModelImpl } from "@dataspecer/core-v2/visual-model";
import { useModelGraphContext } from "../../context/model-context";
import { useViewParam } from "../../util/view-param";
import { DropDownCatalog } from "../../components/management/dropdown-catalog";

export const ViewManagement = () => {
    const { aggregatorView, aggregator, setAggregatorView, addVisualModelToGraph } = useModelGraphContext();
    const { visualModels } = useModelGraphContext();
    const { viewId, setViedIdSearchParam } = useViewParam();

    const activeViewId = aggregatorView.getActiveViewId();
    const availableVisualModelIds = [...new Set(aggregatorView.getAvailableVisualModelIds())];

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
        setAggregatorView(aggregator.getView());
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
