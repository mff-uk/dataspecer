import {DataPsmResource} from "@model-driven-data/core/lib/data-psm/model";
import {useDialog} from "./useDialog";
import {LabelDescriptionEditor} from "../components/helper/LabelDescriptionEditor";
import React, {useCallback} from "react";
import {StoreContext} from "../components/App";
import {SetDataPsmLabelAndDescription} from "../operations/set-data-psm-label-and-description";

export const useDataPsmUpdateLabelAndDescription = (dataPsmResource: DataPsmResource) => {
  const {store} = React.useContext(StoreContext);
  const updateLabels = useDialog(LabelDescriptionEditor, ["data", "update"], {data: {label: {}, description: {}}, update: () => {}});
  const open = useCallback(() => {
    updateLabels.open({
      data: {
        label: dataPsmResource.dataPsmHumanLabel ?? {},
        description: dataPsmResource.dataPsmHumanDescription ?? {},
      },
      update: data => {
        store.executeOperation(new SetDataPsmLabelAndDescription(dataPsmResource.iri as string, data.label, data.description)).then();
      },
    });
  }, [dataPsmResource.dataPsmHumanLabel, dataPsmResource.dataPsmHumanDescription]);

  return {
    Component: updateLabels.Component,
    open,
  }
};
