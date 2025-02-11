import { type DialogProps } from "../dialog-api";
import { t } from "../../application";
import { MultiLanguageInputForLanguageString } from "../../components/input/multi-language-input-4-language-string";
import { DialogDetailRow } from "../../components/dialog/dialog-detail-row";
import { SelectModel } from "../class/components/select-model";
import { EditAssociationProfileDialogState, useEditAssociationProfileDialogController } from "./edit-association-profile-dialog-controller";
import { SelectEntity } from "../class/components/select-entity";
import { SelectCardinality } from "../attribute/components/select-cardinality";
import { InputIri } from "../class/components/input-iri";
import { ValidationMessage } from "./components/validation-message";
import { SelectEntities } from "../class-profile/components/select-entities";
import { ProfiledValue } from "../class-profile/components/profiled-value";

export const EditAssociationProfileDialog = (props: DialogProps<EditAssociationProfileDialogState>) => {
  const controller = useEditAssociationProfileDialogController(props);
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
          />
        </DialogDetailRow>
      </div>
      <div className="grid pb-3 bg-slate-100 md:grid-cols-[25%_75%] md:gap-y-3 md:pl-8 md:pr-16 md:pt-2">
        <DialogDetailRow detailKey={t("modify-class-profile-dialog.profile-of")}>
          <SelectEntities
            language={state.language}
            items={state.availableProfiles}
            value={state.profileOf}
            onAdd={controller.addProfileOf}
            onRemove={controller.removeProfileOf}
            disableRemove={state.profileOf.length === 1}
          />
        </DialogDetailRow>
        <DialogDetailRow detailKey={t("create-class-dialog.name")}>
          <ProfiledValue
            override={state.overrideName}
            onToggleOverride={controller.toggleNameOverride}
            availableProfiles={state.profileOf}
            profile={state.nameSource}
            onChangeProfile={controller.setNameSource}
            language={state.language}
          >
            <MultiLanguageInputForLanguageString
              ls={state.overrideName ? state.name : state.nameSourceValue}
              setLs={controller.setName}
              defaultLang={state.language}
              disabled={!state.overrideName}
              inputType="text"
              className="grow"
            />
          </ProfiledValue>
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
          <ProfiledValue
            override={state.overrideDescription}
            onToggleOverride={controller.toggleDescriptionOverride}
            availableProfiles={state.profileOf}
            profile={state.descriptionSource}
            onChangeProfile={controller.setDescriptionSource}
            language={state.language}
          >
            <MultiLanguageInputForLanguageString
              ls={state.overrideDescription ? state.description : state.descriptionSourceValue}
              setLs={controller.setDescription}
              defaultLang={state.language}
              disabled={!state.overrideDescription}
              inputType="textarea"
              className="grow"
            />
          </ProfiledValue>
        </DialogDetailRow>
        <DialogDetailRow detailKey={t("modify-entity-dialog.usage-note")} >
          <ProfiledValue
            override={state.overrideUsageNote}
            onToggleOverride={controller.toggleUsageNoteOverride}
            availableProfiles={state.profileOf}
            profile={state.usageNoteSource}
            onChangeProfile={controller.setUsageNoteSource}
            hideProfiling={state.hideUsageNoteProfile}
            language={state.language}
          >
            <MultiLanguageInputForLanguageString
              ls={state.overrideUsageNote ? state.usageNote : state.usageNotSourceValue}
              setLs={controller.setUsageNote}
              defaultLang={state.language}
              disabled={!state.overrideUsageNote}
              inputType="textarea"
              className="grow"
            />
          </ProfiledValue>
        </DialogDetailRow>
        {/*  */}
        <DialogDetailRow detailKey={"Domain"}>
          <ProfiledValue
            override={state.overrideDomain}
            onToggleOverride={controller.toggleDomainOverride}
            availableProfiles={state.profileOf}
            profile={state.domainSource}
            onChangeProfile={controller.setDomainSource}
            language={state.language}
          >
            <SelectEntity
              language={state.language}
              items={state.availableDomains}
              value={state.domain}
              onChange={controller.setDomain}
              disabled={!state.overrideDomain}
            />
          </ProfiledValue>
          <ValidationMessage value={state.domainValidation} />
        </DialogDetailRow>
        <DialogDetailRow detailKey={"Domain cardinality"}>
          <ProfiledValue
            override={state.overrideDomainCardinality}
            onToggleOverride={controller.toggleDomainCardinalityOverride}
            availableProfiles={state.profileOf}
            profile={state.domainCardinalitySource}
            onChangeProfile={controller.setDomainCardinalitySource}
            language={state.language}
          >
            <SelectCardinality
              items={state.availableCardinalities}
              value={state.domainCardinality}
              onChange={controller.setDomainCardinality}
              disabled={!state.overrideDomainCardinality}
            />
          </ProfiledValue>
          <ValidationMessage value={state.domainCardinalityValidation} />
        </DialogDetailRow>
        <DialogDetailRow detailKey={"Range"}>
          <ProfiledValue
            override={state.overrideRange}
            onToggleOverride={controller.toggleRangeOverride}
            availableProfiles={state.profileOf}
            profile={state.rangeSource}
            onChangeProfile={controller.setRangeSource}
            language={state.language}
          >
            <SelectEntity
              language={state.language}
              items={state.availableRanges}
              value={state.range}
              onChange={controller.setRange}
              disabled={!state.overrideRange}
            />
          </ProfiledValue>
          <ValidationMessage value={state.rangeValidation} />
        </DialogDetailRow>
        <DialogDetailRow detailKey={"Range cardinality"}>
          <ProfiledValue
            override={state.overrideRangeCardinality}
            onToggleOverride={controller.toggleRangeCardinalityOverride}
            availableProfiles={state.profileOf}
            profile={state.rangeCardinalitySource}
            onChangeProfile={controller.setRangeCardinalitySource}
            language={state.language}
          >
            <SelectCardinality
              items={state.availableCardinalities}
              value={state.rangeCardinality}
              onChange={controller.setRangeCardinality}
              disabled={!state.overrideRangeCardinality}
            />
          </ProfiledValue>
          <ValidationMessage value={state.rangeCardinalityValidation} />
        </DialogDetailRow>
      </div>
    </>
  );
};
