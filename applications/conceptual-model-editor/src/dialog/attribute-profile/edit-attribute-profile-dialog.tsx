import { type DialogWrapper, type DialogProps } from "../dialog-api";
import { configuration, t } from "../../application";
import { MultiLanguageInputForLanguageString } from "../../components/input/multi-language-input-4-language-string";
import { DialogDetailRow } from "../../components/dialog/dialog-detail-row";
import { SelectModel } from "../class/components/select-model";
import { CreateAttributeProfileDialogState, useCreateAttributeProfileDialogController } from "./edit-attribute-profile-dialog-controller";
import { SelectEntity } from "../class/components/select-entity";
import { SelectCardinality } from "../attribute/components/select-cardinality";
import { InputIri } from "../class/components/input-iri";
import { OverrideCheckbox } from "../class-profile/components/checkbox-override";
import { languageStringToString } from "../../utilities/string";
import { ValidationMessage } from "../association-profile/components/validation-message";
import { SelectDataType } from "../attribute/components/select-data-type";
import { isValid } from "../utilities/validation-utilities";

export const createCreateAttributeProfileDialog = (
  state: CreateAttributeProfileDialogState,
  onConfirm: (state: CreateAttributeProfileDialogState) => void,
): DialogWrapper<CreateAttributeProfileDialogState> => {
  return {
    label: "create-attribute-dialog.label",
    component: CreateAttributeProfileDialog,
    state,
    confirmLabel: "create-profile-dialog.btn-ok",
    cancelLabel: "create-profile-dialog.btn-close",
    validate: validate,
    onConfirm: onConfirm,
    onClose: null,
  };
}

function validate(state: CreateAttributeProfileDialogState): boolean {
  return state.iri.trim() !== ""
    && isValid(state.domainValidation)
    && isValid(state.domainCardinalityValidation)
    && isValid(state.rangeValidation)
    && isValid(state.rangeCardinalityValidation);
}

const CreateAttributeProfileDialog = (props: DialogProps<CreateAttributeProfileDialogState>) => {
  const controller = useCreateAttributeProfileDialogController(props);
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
        <DialogDetailRow detailKey={"Domain"}>
          <div className="flex">
            <SelectEntity
              language={state.language}
              items={state.availableDomainItems}
              value={state.domain}
              onChange={controller.setDomain}
              disabled={!state.overrideDomain}
            />
            <OverrideCheckbox
              value={state.overrideDomain}
              onToggle={controller.toggleDomainOverride}
            />
          </div>
          <ValidationMessage value={state.domainValidation} />
        </DialogDetailRow>
        <DialogDetailRow detailKey={"Domain cardinality"}>
          <div className="flex">
            <SelectCardinality
              items={state.availableCardinalities}
              value={state.domainCardinality}
              onChange={controller.setDomainCardinality}
              disabled={!state.overrideDomainCardinality}
            />
            <OverrideCheckbox
              value={state.overrideDomainCardinality}
              onToggle={controller.toggleDomainCardinalityOverride}
            />
          </div>
          <ValidationMessage value={state.domainCardinalityValidation} />
        </DialogDetailRow>
        <DialogDetailRow detailKey={"Range"}>
          <div className="flex">
            <SelectDataType
              language={state.language}
              items={state.availableRangeItems}
              value={state.range}
              onChange={controller.setRange}
              disabled={!state.overrideRange}
            />
            <OverrideCheckbox
              value={state.overrideRange}
              onToggle={controller.toggleRangeOverride}
            />
          </div>
          <ValidationMessage value={state.rangeValidation} />
        </DialogDetailRow>
        <DialogDetailRow detailKey={"Range cardinality"}>
          <div className="flex">
            <SelectCardinality
              items={state.availableCardinalities}
              value={state.rangeCardinality}
              onChange={controller.setRangeCardinality}
              disabled={!state.overrideRangeCardinality}
            />
            <OverrideCheckbox
              value={state.overrideRangeCardinality}
              onToggle={controller.toggleRangeCardinalityOverride}
            />
          </div>
          <ValidationMessage value={state.rangeCardinalityValidation} />
        </DialogDetailRow>
      </div>
    </>
  );
};
