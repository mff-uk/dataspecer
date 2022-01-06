import {useDialog} from "./useDialog";
import {LabelDescriptionEditor} from "../components/helper/LabelDescriptionEditor";
import React, {useCallback} from "react";
import {StoreContext} from "../components/App";
import {PimResource} from "model-driven-data/pim/model";
import {SetPimLabelAndDescription} from "../operations/set-pim-label-and-description";

export const usePimUpdateLabelAndDescription = (pimResource: PimResource) => {
  const {store} = React.useContext(StoreContext);
  const updateLabels = useDialog(LabelDescriptionEditor, ["data", "update"], {data: {label: {}, description: {}}, update: () => {}});
  const open = useCallback(() => {
    updateLabels.open({
      data: {
        label: pimResource.pimHumanLabel ?? {},
        description: pimResource.pimHumanDescription ?? {},
      },
      update: data => {
        store.executeOperation(new SetPimLabelAndDescription(pimResource.iri as string, data.label, data.description)).then();
      },
    });
  }, [pimResource.pimHumanLabel, pimResource.pimHumanDescription]);

  return {
    Component: updateLabels.Component,
    open,
  }
};
