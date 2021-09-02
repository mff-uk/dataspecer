import {useDialog} from "./useDialog";
import {LabelDescriptionEditor} from "../components/helper/LabelDescriptionEditor";
import React, {useCallback} from "react";
import {StoreContext} from "../components/App";
import {PimResource} from "model-driven-data/pim/model";

export const usePimUpdateLabelAndDescription = (pimResource: PimResource) => {
  const {updatePimLabelAndDescription} = React.useContext(StoreContext);
  const updateLabels = useDialog(LabelDescriptionEditor, ["data", "update"], {data: {label: {}, description: {}}, update: () => {}});
  const open = useCallback(() => {
    updateLabels.open({
      data: {
        label: pimResource.pimHumanLabel ?? {},
        description: pimResource.pimHumanDescription ?? {},
      },
      update: data => {
        updatePimLabelAndDescription({
          forPimResourceIri: pimResource.iri as string,
          label: data.label,
          description: data.description,
        });
      },
    });
  }, [pimResource.pimHumanLabel, pimResource.pimHumanDescription]);

  return {
    component: updateLabels.component,
    open,
  }
};
