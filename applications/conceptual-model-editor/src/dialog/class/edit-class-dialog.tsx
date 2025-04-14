import { DialogWrapper, type DialogProps } from "../dialog-api";
import { t } from "../../application";
import { MultiLanguageInputForLanguageString } from "../../components/input/multi-language-input-4-language-string";
import { DialogDetailRow } from "../../components/dialog/dialog-detail-row";
import { SelectModel } from "../components/select-model";
import { SpecializationSelect } from "../components/select-specialization";
import { InputIri } from "../components/input-iri";
import { useClassDialogController } from "./edit-class-dialog-controller";
import { ValidationMessage } from "../components/validation-message";
import { ClassDialogState } from "./edit-class-dialog-state";
import { isValid } from "../utilities/validation-utilities";
import { InputText } from "../components/input-test";

const ClassDialog = (props: DialogProps<ClassDialogState>) => {
  const controller = useClassDialogController(props);
  const state = props.state;
  return (
    <>
      <div
        className="grid gap-y-2 md:grid-cols-[25%_75%] md:gap-y-3 bg-slate-100 md:pb-4 md:pl-8 md:pr-16 md:pt-2"
        style={{ backgroundColor: state.model.displayColor }}
      >
        <DialogDetailRow detailKey={t("model")}>
          <SelectModel
            language={state.language}
            items={state.availableModels}
            value={state.model}
            onChange={controller.setModel}
            disabled={state.disableModelChange}
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
            iriPrefix={state.model.baseIri ?? ""}
            isRelative={state.isIriRelative}
            setIsRelative={controller.setIsIriRelative}
            value={state.iri}
            onChange={controller.setIri}
          />
          <ValidationMessage value={state.iriValidation} />
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
        <DialogDetailRow detailKey={t("create-class-dialog.external-documentation-url")}>
          <InputText
            value={state.externalDocumentationUrl}
            onChange={controller.setExternalDocumentationUrl}
          />
        </DialogDetailRow>
      </div>
    </>
  );
};

export const createNewClassDialog = (
  state: ClassDialogState,
  onConfirm: (state: ClassDialogState) => void | null,
): DialogWrapper<ClassDialogState> => {
  return {
    label: "dialog.class.label-create",
    component: ClassDialog,
    state,
    confirmLabel: "dialog.class.ok-create",
    cancelLabel: "dialog.class.cancel",
    validate: (state) => isValid(state.iriValidation),
    onConfirm,
    onClose: null,
  };
};

export const createEditClassDialog = (
  state: ClassDialogState,
  onConfirm: (state: ClassDialogState) => void | null,
): DialogWrapper<ClassDialogState> => {
  return {
    label: "dialog.class.label-edit",
    component: ClassDialog,
    state,
    confirmLabel: "dialog.class.ok-edit",
    cancelLabel: "dialog.class.cancel",
    validate: (state) => isValid(state.iriValidation),
    onConfirm,
    onClose: null,
  };
};
