import { type DialogWrapper, type DialogProps } from "../dialog-api";
import { t } from "../../application";
import { MultiLanguageInputForLanguageString } from "../../components/input/multi-language-input-4-language-string";
import { DialogDetailRow } from "../../components/dialog/dialog-detail-row";
import { SelectModel } from "./components/select-model";
import { SpecializationSelect } from "./components/select-specialization";
import { InputIri } from "./components/input-iri";
import { EditClassDialogState, useEditClassDialogController } from "./edit-class-dialog-controller";

export const createEditClassDialog = (
  state: EditClassDialogState,
  onConfirm: (state: EditClassDialogState) => void | null,
): DialogWrapper<EditClassDialogState> => {
  return {
    label: "create-class-dialog.label",
    component: EditClassDialog,
    state,
    confirmLabel: "create-class-dialog.btn-ok",
    cancelLabel: "create-class-dialog.btn-cancel",
    validate: validate,
    onConfirm,
    onClose: null,
  };
};

function validate(state: EditClassDialogState): boolean {
  return state.iri.trim() !== "";
}

const EditClassDialog = (props: DialogProps<EditClassDialogState>) => {
  const controller = useEditClassDialogController(props);
  const state = props.state;
  return (
    <>
      <div
        className="grid gap-y-2 md:grid-cols-[25%_75%] md:gap-y-3 bg-slate-100 md:pb-4 md:pl-8 md:pr-16 md:pt-2"
        style={{ backgroundColor: state.model.color }}
      >
        <DialogDetailRow detailKey={t("model")}>
          <SelectModel
            language={state.language}
            items={state.writableModels}
            value={state.model}
            onChange={controller.setModel}
          />
        </DialogDetailRow>
      </div>
      <div className="grid bg-slate-100 md:grid-cols-[25%_75%] md:gap-y-3 md:pl-8 md:pr-16 md:pt-2">
        <DialogDetailRow detailKey={t("create-class-dialog.name")} className="text-xl">
          <MultiLanguageInputForLanguageString
            ls={state.name}
            setLs={controller.setName}
            defaultLang={state.language}
            inputType="text"
          />
        </DialogDetailRow>
        <DialogDetailRow detailKey={t("create-class-dialog.iri")}>
          <InputIri
            iriPrefix={state.iriPrefix}
            isRelative={state.isIriRelative}
            setIsRelative={controller.setIsRelative}
            value={state.iri}
            onChange={controller.setIri}
          />
        </DialogDetailRow>
        <DialogDetailRow detailKey={t("modify-entity-dialog.specialization-of")}>
          <SpecializationSelect
            language={state.language}
            items={state.availableSpecializations}
            specializations={state.specializations}
            addSpecialization={controller.addSpecialization}
            removeSpecialization={controller.removeSpecialization}
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
  );
};
