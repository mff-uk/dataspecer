import { DialogWrapper, type DialogProps } from "../dialog-api";
import { configuration, t } from "../../application";
import { MultiLanguageInputForLanguageString } from "../../components/input/multi-language-input-4-language-string";
import { DialogDetailRow } from "../../components/dialog/dialog-detail-row";
import { SelectModel } from "../components/select-model";
import { SelectEntity } from "../components/select-entity";
import { SelectDataType } from "../components/select-data-type";
import { SelectCardinality } from "../components/select-cardinality";
import { InputIri } from "../components/input-iri";
import { ValidationMessage } from "../components/validation-message";
import { isValid } from "../utilities/validation-utilities";
import { AttributeDialogState } from "./edit-attribute-dialog-state";
import { useAttributeDialogController } from "./edit-attribute-dialog-controller";
import { SpecializationSelect } from "../components/select-specialization";

export const AttributeDialog = (props: DialogProps<AttributeDialogState>) => {
  const controller = useAttributeDialogController(props);
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
      <div className="grid pb-3 bg-slate-100 md:grid-cols-[25%_75%] md:gap-y-3 md:pl-8 md:pr-16 md:pt-2">
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
        <DialogDetailRow detailKey={t("domain")}>
          <SelectEntity
            language={state.language}
            items={state.availableDomains}
            value={state.domain}
            onChange={controller.setDomain}
          />
          <ValidationMessage value={state.domainValidation} />
        </DialogDetailRow>
        {configuration().hideRelationCardinality ? null :
          <DialogDetailRow detailKey={t("domain-cardinality")}>
            <SelectCardinality
              items={state.availableCardinalities}
              value={state.domainCardinality}
              onChange={controller.setDomainCardinality}
            />
          </DialogDetailRow>
        }
        <DialogDetailRow detailKey={t("range")}>
          <SelectDataType
            language={state.language}
            items={state.availableRanges}
            value={state.range}
            onChange={controller.setRange}
          />
          <ValidationMessage value={state.rangeValidation} />
        </DialogDetailRow>
        {configuration().hideRelationCardinality ? null :
          <DialogDetailRow detailKey={t("range-cardinality")}>
            <SelectCardinality
              items={state.availableCardinalities}
              value={state.rangeCardinality}
              onChange={controller.setRangeCardinality}
            />
          </DialogDetailRow>
        }
      </div>
    </>
  );
};

export const createNewAttributeDialog = (
  state: AttributeDialogState,
  onConfirm: (state: AttributeDialogState) => void,
): DialogWrapper<AttributeDialogState> => {
  return {
    label: "dialog.attribute.label-create",
    component: AttributeDialog,
    state,
    confirmLabel: "dialog.attribute.ok-create",
    cancelLabel: "dialog.attribute.cancel",
    validate: (state) => isValid(state.iriValidation)
      && isValid(state.domainValidation)
      && isValid(state.rangeValidation),
    onConfirm: onConfirm,
    onClose: null,
  };
}

export const createEditAttributeDialog = (
  state: AttributeDialogState,
  onConfirm: (state: AttributeDialogState) => void,
): DialogWrapper<AttributeDialogState> => {
  return {
    label: "dialog.attribute.label-edit",
    component: AttributeDialog,
    state,
    confirmLabel: "dialog.attribute.ok-edit",
    cancelLabel: "dialog.attribute.cancel",
    validate: (state) => isValid(state.iriValidation)
      && isValid(state.domainValidation)
      && isValid(state.rangeValidation),
    onConfirm: onConfirm,
    onClose: null,
  };
}

export const createAddAttributeDialog = (
  state: AttributeDialogState,
  onConfirm: (state: AttributeDialogState) => void,
): DialogWrapper<AttributeDialogState> => {
  return {
    label: "dialog.attribute.label-create",
    component: AttributeDialog,
    state,
    confirmLabel: "dialog.attribute.ok-create",
    cancelLabel: "dialog.attribute.cancel",
    validate: (state) => isValid(state.iriValidation)
      && isValid(state.domainValidation)
      && isValid(state.rangeValidation),
    onConfirm: onConfirm,
    onClose: null,
  };
}
