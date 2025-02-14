import { type DialogProps } from "../dialog-api";
import { t } from "../../application";
import { MultiLanguageInputForLanguageString } from "../../components/input/multi-language-input-4-language-string";
import { DialogDetailRow } from "../../components/dialog/dialog-detail-row";
import { SelectModel } from "../class/components/select-model";
import { InputIri } from "../class/components/input-iri";
import { EditClassProfileDialogState, useEditClassProfileDialogController } from "./edit-class-profile-dialog-controller";
import { ValidationMessage } from "../association-profile/components/validation-message";
import { SelectEntities } from "./components/select-entities";
import { ProfiledValueWithSource } from "./components/profiled-value";

export const EditClassProfileDialog = (props: DialogProps<EditClassProfileDialogState>) => {
  const controller = useEditClassProfileDialogController(props);
  const state = props.state;
  return (
    <>
      <div
        className="grid gap-y-2 md:grid-cols-[25%_75%] md:gap-y-3 bg-slate-100 md:pb-4 md:pl-8 md:pr-16 md:pt-2"
        style={{ backgroundColor: state.model.displayColor }}      >
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
        <DialogDetailRow detailKey={t("modify-class-profile-dialog.profile-of")}>
          <SelectEntities
            language={state.language}
            items={state.availableProfiles}
            value={state.profiles}
            onAdd={controller.addProfile}
            onRemove={controller.removeProfile}
          />
        </DialogDetailRow>
        <DialogDetailRow detailKey={t("create-class-dialog.name")}>
          <ProfiledValueWithSource
            override={state.overrideName}
            onToggleOverride={controller.toggleNameOverride}
            availableProfiles={state.profiles}
            profile={state.nameSource}
            onChangeProfile={controller.setNameSource}
            language={state.language}
            hideProfiling={state.hideNameProfile}
          >
            <MultiLanguageInputForLanguageString
              ls={state.overrideName ? state.name : state.nameSourceValue}
              setLs={controller.setName}
              defaultLang={state.language}
              disabled={!state.overrideName}
              inputType="text"
              className="grow"
            />
          </ProfiledValueWithSource>
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
        <DialogDetailRow detailKey={t("create-class-dialog.description")}>
          <ProfiledValueWithSource
            override={state.overrideDescription}
            onToggleOverride={controller.toggleDescriptionOverride}
            availableProfiles={state.profiles}
            profile={state.descriptionSource}
            onChangeProfile={controller.setDescriptionSource}
            language={state.language}
            hideProfiling={state.hideDescriptionProfile}
          >
            <MultiLanguageInputForLanguageString
              ls={state.overrideDescription ? state.description : state.descriptionSourceValue}
              setLs={controller.setDescription}
              defaultLang={state.language}
              disabled={!state.overrideDescription}
              inputType="textarea"
              className="grow"
            />
          </ProfiledValueWithSource>
        </DialogDetailRow>
        <DialogDetailRow detailKey={t("modify-entity-dialog.usage-note")} >
          <ProfiledValueWithSource
            override={state.overrideUsageNote}
            onToggleOverride={controller.toggleUsageNoteOverride}
            availableProfiles={state.profiles}
            profile={state.usageNoteSource}
            onChangeProfile={controller.setUsageNoteSource}
            language={state.language}
            hideProfiling={state.hideUsageNoteProfile}
          >
            <MultiLanguageInputForLanguageString
              ls={state.overrideUsageNote ? state.usageNote : state.usageNoteSourceValue}
              setLs={controller.setUsageNote}
              defaultLang={state.language}
              disabled={!state.overrideUsageNote}
              inputType="textarea"
              className="grow"
            />
          </ProfiledValueWithSource>
        </DialogDetailRow>
      </div>
    </>
  );
};
