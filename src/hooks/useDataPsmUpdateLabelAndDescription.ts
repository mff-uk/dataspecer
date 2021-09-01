import {DataPsmResource} from "model-driven-data/data-psm/model";
import {useDialog} from "./useDialog";
import {LabelDescriptionEditor} from "../components/psmDetail/LabelDescriptionEditor";
import React, {useCallback} from "react";
import {StoreContext} from "../components/App";

export const useDataPsmUpdateLabelAndDescription = (dataPsmResource: DataPsmResource) => {
  const {updateDataPsmLabelAndDescription} = React.useContext(StoreContext);
  const updateLabels = useDialog(LabelDescriptionEditor, ["data", "update"], {data: {label: {}, description: {}}, update: () => {}});
  const open = useCallback(() => {
    updateLabels.open({
      data: {
        label: dataPsmResource.dataPsmHumanLabel ?? {},
        description: dataPsmResource.dataPsmHumanDescription ?? {},
      },
      update: data => {
        updateDataPsmLabelAndDescription({
          forDataPsmResourceIri: dataPsmResource.iri as string,
          label: data.label,
          description: data.description,
        });
      },
    });
  }, [dataPsmResource.dataPsmHumanLabel, dataPsmResource.dataPsmHumanDescription]);

  return {
    component: updateLabels.component,
    open,
  }
};
