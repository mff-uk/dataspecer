import { type DialogWrapper, type DialogProps } from "../dialog-api";
import { t, configuration } from "../../application";
import { MultiLanguageInputForLanguageString } from "../../components/input/multi-language-input-4-language-string";
import { DialogDetailRow } from "../../components/dialog/dialog-detail-row";
import { IriInput } from "../../components/input/iri-input";
import { CreateClassDialogState, useCreateClassDialogController } from "./create-class-dialog-controller";
import { ModelSelect } from "./components/model-select";
import { SpecializationSelect } from "./components/specialization-select";

export const createCreateClassDialog = (
  state: CreateClassDialogState,
  onConfirm: (state: CreateClassDialogState) => void | null,
): DialogWrapper<CreateClassDialogState> => {
  return {
    label: "create-class-dialog.label",
    component: CreateClassDialog,
    state,
    confirmLabel: "create-class-dialog.btn-ok",
    cancelLabel: "create-class-dialog.btn-cancel",
    validate: validate,
    onConfirm,
    onClose: null,
  };
};

function validate(state: CreateClassDialogState): boolean {
  return state.iri.trim() !== "";
}

const CreateClassDialog = (props: DialogProps<CreateClassDialogState>) => {
  const controller = useCreateClassDialogController(props);
  const state = props.state;
  return (
    <>
      <div
        className="grid gap-y-2 md:grid-cols-[25%_75%] md:gap-y-3 bg-slate-100 md:pb-4 md:pl-8 md:pr-16 md:pt-2"
        style={{ backgroundColor: state.model.color }}
      >
        <DialogDetailRow detailKey={t("model")}>
          <ModelSelect
            language={state.language}
            items={state.writableModels}
            value={state.model}
            onChange={controller.setModel}
          />
        </DialogDetailRow>
      </div>
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
            iriHasChanged={state.iriHasChanged}
            onChange={controller.onIriChanged}
            baseIri={state.baseIri}
            nameSuggestion={configuration().nameToClassIri}
          />
        </DialogDetailRow>
        <DialogDetailRow detailKey={t("modify-entity-dialog.specialization-of")}>
          <SpecializationSelect
            language={state.language}
            items={state.availableClasses}
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
