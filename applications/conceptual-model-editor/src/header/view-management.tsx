import { useEffect } from "react";
import { useModelGraphContext } from "../context/model-context";
import { DropDownCatalog } from "../components/management/dropdown-catalog";
import { useQueryParamsContext } from "../context/query-params-context";
import { createWritableVisualModel } from "../dataspecer/visual-model/visual-model-factory";
import { languageStringToString } from "../utilities/string";
import { configuration } from "../application";
import { useOptions } from "../configuration/options";

export const ViewManagement = () => {
  const {
    aggregatorView,
    aggregator,
    setAggregatorView,
    addVisualModel,
    visualModels,
    removeVisualModel
  } = useModelGraphContext();
  const { language } = useOptions();

  const { updateViewId: setViewIdSearchParam } = useQueryParamsContext();

  const activeViewId = aggregatorView.getActiveViewId();
  const availableVisualModelIds = aggregatorView.getAvailableVisualModels()
    .map(item => [
      item.getId(),
      item.getLabel() === null ?  null : languageStringToString(
        configuration().languagePreferences, language,  item.getLabel()!),
    ] as [string, string]);

  useEffect(() => {
    if (activeViewId === undefined) {
      console.log("Ignore change in activeViewId as it is null.");
      return;
    }
    setViewIdSearchParam(activeViewId ?? null);
  }, [activeViewId, setViewIdSearchParam]);

  const setActiveViewId = (modelId: string) => {
    aggregatorView.changeActiveVisualModel(modelId);
  };

  const handleViewSelected = (viewId: string) => {
    setActiveViewId(viewId);
    setAggregatorView(aggregator.getView());
    setViewIdSearchParam(activeViewId ?? null);
  };

  const handleCreateNewView = () => {
    const activeVisualModel = aggregatorView.getActiveVisualModel();
    const model = createWritableVisualModel(activeVisualModel);
    model.setLabel({"en": "View"});
    addVisualModel(model);
    aggregatorView.changeActiveVisualModel(model.getId());
    setAggregatorView(aggregator.getView());
    setViewIdSearchParam(activeViewId ?? null);
  };

  const handleViewDeleted = (viewId: string) => {
    const visualModel = visualModels.get(viewId);
    if (!visualModel) {
      return;
    }
    removeVisualModel(viewId);
  };

  return (
    <DropDownCatalog
      label="view"
      valueSelected={activeViewId ?? null}
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
