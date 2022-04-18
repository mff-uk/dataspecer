import {useDialog} from "./useDialog";
import {LabelDescriptionEditor} from "../components/helper/LabelDescriptionEditor";
import {useCallback, useContext} from "react";
import {PimResource} from "@dataspecer/core/pim/model";
import {SetPimLabelAndDescription} from "../operations/set-pim-label-and-description";
import {useFederatedObservableStore} from "@dataspecer/federated-observable-store-react/store";

export const usePimUpdateLabelAndDescription = (pimResource: PimResource) => {
  const store = useFederatedObservableStore();
  const updateLabels = useDialog(LabelDescriptionEditor, ["data", "update"], {data: {label: {}, description: {}}, update: () => {}});
  const open = useCallback(() => {
    updateLabels.open({
      data: {
        label: pimResource.pimHumanLabel ?? {},
        description: pimResource.pimHumanDescription ?? {},
      },
      update: data => {
        store.executeComplexOperation(new SetPimLabelAndDescription(pimResource.iri as string, data.label, data.description)).then();
      },
    });
  }, [pimResource.pimHumanLabel, pimResource.pimHumanDescription]);

  return {
    Component: updateLabels.Component,
    open,
  }
};
