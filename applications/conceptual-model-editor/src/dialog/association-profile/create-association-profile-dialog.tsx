import { type DialogWrapper, type DialogProps } from "../dialog-api";
import { t } from "../../application";
import { MultiLanguageInputForLanguageString } from "../../components/input/multi-language-input-4-language-string";
import { DialogDetailRow } from "../../components/dialog/dialog-detail-row";
import { SelectModel } from "../class/components/select-model";
import { CreateAssociationProfileDialogState, useCreateAssociationProfileDialogController } from "./create-association-profile-dialog-controller";
import { SelectEntity } from "../class/components/select-entity";
import { SelectCardinality } from "../attribute/components/select-cardinality";
import { InputIri } from "../class/components/input-iri";

export const createCreateAssociationDialog = (
  state: CreateAssociationProfileDialogState,
  onConfirm: (state: CreateAssociationProfileDialogState) => void,
): DialogWrapper<CreateAssociationProfileDialogState> => {
  return {
    label: "create-association-dialog.label",
    component: CreateAssociationDialog,
    state,
    confirmLabel: "modify-dialog.btn-ok",
    cancelLabel: "modify-dialog.btn-close",
    validate: validate,
    onConfirm: onConfirm,
    onClose: null,
  };
}

function validate(state: CreateAssociationProfileDialogState): boolean {
  return state.iri.trim() !== "";
}

const CreateAssociationDialog = (props: DialogProps<CreateAssociationProfileDialogState>) => {
  const controller = useCreateAssociationProfileDialogController(props);
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
        <DialogDetailRow detailKey={t("create-class-dialog.description")}>
          <MultiLanguageInputForLanguageString
            ls={state.description}
            setLs={controller.setDescription}
            defaultLang={state.language}
            inputType="textarea"
          />
        </DialogDetailRow>
        <DialogDetailRow detailKey={"Domain"}>
          <SelectEntity
            language={state.language}
            items={state.availableDomainItems}
            value={state.domain}
            onChange={controller.setDomain}
          />
        </DialogDetailRow>
        <DialogDetailRow detailKey={"Domain cardinality"}>
          <SelectCardinality
            items={state.availableCardinalities}
            value={state.domainCardinality}
            onChange={controller.setDomainCardinality}
          />
        </DialogDetailRow>
        <DialogDetailRow detailKey={"Range"}>
          <SelectEntity
            language={state.language}
            items={state.availableRangeItems}
            value={state.range}
            onChange={controller.setRange}
          />
        </DialogDetailRow>
        <DialogDetailRow detailKey={"Range cardinality"}>
          <SelectCardinality
            items={state.availableCardinalities}
            value={state.rangeCardinality}
            onChange={controller.setRangeCardinality}
          />
        </DialogDetailRow>
      </div>
    </>
  );
};
