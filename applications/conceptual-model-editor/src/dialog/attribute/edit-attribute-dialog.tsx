import { type DialogWrapper, type DialogProps } from "../dialog-api";
import { t, configuration } from "../../application";
import { MultiLanguageInputForLanguageString } from "../../components/input/multi-language-input-4-language-string";
import { DialogDetailRow } from "../../components/dialog/dialog-detail-row";
import { SelectModel } from "../class/components/select-model";
import { SelectEntity } from "../class/components/select-entity";
import { SelectDataType } from "./components/select-data-type";
import { SelectCardinality } from "./components/select-cardinality";
import { InputIri } from "../class/components/input-iri";
import { EditAttributeDialogState, useEditAttributeDialogController } from "./edit-attribute-dialog-controller";
import { SpecializationSelect } from "../class/components/select-specialization";

export const createEditAttributeDialog = (
  state: EditAttributeDialogState,
  onConfirm: (state: EditAttributeDialogState) => void,
): DialogWrapper<EditAttributeDialogState> => {
  return {
    label: "create-attribute-dialog.label",
    component: EditAttributeDialog,
    state,
    confirmLabel: "modify-dialog.btn-ok",
    cancelLabel: "modify-dialog.btn-close",
    validate: validate,
    onConfirm: onConfirm,
    onClose: null,
  };
}

function validate(state: EditAttributeDialogState): boolean {
  return state.iri.trim() !== "";
}

const EditAttributeDialog = (props: DialogProps<EditAttributeDialogState>) => {
  const controller = useEditAttributeDialogController(props);
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
        <DialogDetailRow detailKey={t("domain")}>
          <SelectEntity
            language={state.language}
            items={state.availableDomainItems}
            value={state.domain}
            onChange={controller.setDomain}
          />
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
            items={state.availableRangeItems}
            value={state.range}
            onChange={controller.setRange}
          />
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
