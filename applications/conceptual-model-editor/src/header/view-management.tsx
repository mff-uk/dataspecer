import { useEffect } from "react";
import { useModelGraphContext } from "../context/model-context";
import { DropDownCatalog } from "../components/management/dropdown-catalog";
import { useQueryParamsContext } from "../context/query-params-context";
import { languageStringToString } from "../utilities/string";
import { configuration } from "../application";
import { useOptions } from "../configuration/options";
import { useActions } from "@/action/actions-react-binding";

export const ViewManagement = () => {
  const {
    aggregatorView,
    visualModels,
    removeVisualModel
  } = useModelGraphContext();
  const { language } = useOptions();

  const actions = useActions();

  const { updateViewId: setViewIdSearchParam } = useQueryParamsContext();

  const activeViewId = aggregatorView.getActiveViewId();
  const availableVisualModelIds = aggregatorView.getAvailableVisualModels()
    .map(item => [
      item.getId(),
      item.getLabel() === null ?  null : languageStringToString(
        configuration().languagePreferences, language, item.getLabel()!),
    ] as [string, string]);

  useEffect(() => {
    if (activeViewId === undefined) {
      console.log("Ignore change in activeViewId as it is null.");
      return;
    }
    setViewIdSearchParam(activeViewId ?? null);
  }, [activeViewId, setViewIdSearchParam]);

  const handleViewSelected = (viewId: string) => {
    actions.changeVisualModel(viewId);
  };

  const handleCreateNewView = () => {
    actions.createNewVisualModel(true);
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
      specialButtons={[{
        content: "📦",
        callback: (value: string) => actions.addVisualDiagramNodeForExistingModelToVisualModel(value)
      }]}
    >
      <button className="white ml-2 text-[15px]" onClick={handleCreateNewView} title="create a new view">
        <span className="font-bold">+</span>🖼️
      </button>
    </DropDownCatalog>
  );
};
