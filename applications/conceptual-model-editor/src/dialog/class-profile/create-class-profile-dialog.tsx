import { type DialogWrapper, type DialogProps } from "../dialog-api";
import { configuration, t } from "../../application";
import { MultiLanguageInputForLanguageString } from "../../components/input/multi-language-input-4-language-string";
import { DialogDetailRow } from "../../components/dialog/dialog-detail-row";
import { CreateClassProfileDialogState, useCreateClassProfileDialogController } from "./create-class-profile-dialog-controller";
import { SelectModel } from "../class/components/select-model";
import { OverrideCheckbox } from "./components/checkbox-override";
import { InputIri } from "../class/components/input-iri";
import { languageStringToString } from "../../utilities/string";

export const createCreateClassProfileDialog = (
  state: CreateClassProfileDialogState,
  onConfirm: (state: CreateClassProfileDialogState) => void | null,
): DialogWrapper<CreateClassProfileDialogState> => {
  return {
    label: "create-class-profile-dialog.label",
    component: CreateClassProfileDialog,
    state,
    confirmLabel: "create-profile-dialog.btn-ok",
    cancelLabel: "create-profile-dialog.btn-close",
    validate: validate,
    onConfirm,
    onClose: null,
  };
};

function validate(state: CreateClassProfileDialogState): boolean {
  return state.iri.trim() !== "";
}

const CreateClassProfileDialog = (props: DialogProps<CreateClassProfileDialogState>) => {
  const controller = useCreateClassProfileDialogController(props);
  const state = props.state;
  const languagePreferences = configuration().languagePreferences;
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
        <DialogDetailRow detailKey={t("modify-class-profile-dialog.profile-of")}>
          <div>
            {languageStringToString(
              languagePreferences,
              state.language, state.profileOf.label)}
          </div>
        </DialogDetailRow>
        <DialogDetailRow detailKey={t("create-class-dialog.name")} className="flex">
          <MultiLanguageInputForLanguageString
            ls={state.name}
            setLs={controller.setName}
            defaultLang={state.language}
            disabled={!state.overrideName}
            inputType="text"
            className="grow"
          />
          <OverrideCheckbox
            value={state.overrideName}
            onToggle={controller.toggleNameOverride}
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
        <DialogDetailRow detailKey={t("create-class-dialog.description")} className="flex">
          <MultiLanguageInputForLanguageString
            ls={state.description}
            setLs={controller.setDescription}
            defaultLang={state.language}
            disabled={!state.overrideDescription}
            inputType="textarea"
            className="grow"
          />
          <OverrideCheckbox
            value={state.overrideDescription}
            onToggle={controller.toggleDescriptionOverride}
          />
        </DialogDetailRow>
        <DialogDetailRow detailKey={t("modify-entity-dialog.usage-note")} className="flex">
          <MultiLanguageInputForLanguageString
            ls={state.usageNote}
            setLs={controller.setUsageNote}
            defaultLang={state.language}
            disabled={!state.overrideUsageNote}
            inputType="textarea"
            className="grow"
          />
          {state.disableOverrideUsageNote ? null :
            <OverrideCheckbox
              value={state.overrideUsageNote}
              onToggle={controller.toggleUsageNoteOverride}
            />
          }
        </DialogDetailRow>
      </div>
    </>
  );
};
