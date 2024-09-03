import { DialogWrapper, DialogProps } from "../dialog-api";
import { t, configuration } from "../../application";

import { DialogColoredModelHeaderWithModelSelector } from "../../components/dialog/dialog-colored-model-header";
import { MultiLanguageInputForLanguageString } from "../../components/input/multi-language-input-4-language-string";
import { DialogDetailRow } from "../../components/dialog/dialog-detail-row";
import { IriInput } from "../../components/input/iri-input";

import {
  type EditClassState,
  createEditClassNewState,
  useEditClassController,
} from "./edit-class-dialog-controller";
import { EntityModel } from "@dataspecer/core-v2";

export const createEditClassDialog = (
  model: EntityModel,
  language: string,
  onConfirm: (state: EditClassState) => void | null,
): DialogWrapper<EditClassState> => {
  return {
    label: "create-class-dialog.label",
    component: EditClassDialog,
    state: createEditClassNewState(model, language),
    confirmLabel: "create-class-dialog.btn-ok",
    cancelLabel: "create-class-dialog.btn-cancel",
    validate: validate,
    onConfirm,
    onClose: null,
  };
};

function validate(state: EditClassState): boolean {
  return state.iri.trim() !== ""
};

const EditClassDialog = (props: DialogProps<EditClassState>) => {
  const state = props.state;
  const controller = useEditClassController(props);

  return (
    <>
      <DialogColoredModelHeaderWithModelSelector
        style="grid gap-y-2 md:grid-cols-[25%_75%] md:gap-y-3 bg-slate-100 md:pb-4 md:pl-8 md:pr-16 md:pt-2"
        activeModel={state.model?.getId()}
        onModelSelected={controller.setModel}
      />
      <div className="grid bg-slate-100 md:grid-cols-[25%_75%] md:gap-y-3 md:pl-8 md:pr-16 md:pt-2">
        <DialogDetailRow detailKey={t("create-class-dialog.name")} style="text-xl">
          <MultiLanguageInputForLanguageString
            ls={state.name}
            setLs={controller.setName}
            defaultLang={state.language}
            inputType="text"
          />
        </DialogDetailRow>
        <DialogDetailRow detailKey={t("create-class-dialog.iri")}>
          <IriInput
            name={state.name}
            newIri={state.iri}
            setNewIri={controller.setIri}
            iriHasChanged={!state.autoGenerateIri}
            onChange={controller.onUserChangedIri}
            baseIri={state.baseIri}
            nameSuggestion={configuration().nameToClassIri}
          />
        </DialogDetailRow>
        <DialogDetailRow detailKey={t("create-class-dialog.description")}>
          <MultiLanguageInputForLanguageString
            ls={state.description}
            setLs={controller.setDescription}
            defaultLang={state.language}
            inputType="textarea"
          />
        </DialogDetailRow>
      </div>
    </>
  )
}
