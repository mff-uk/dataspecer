import { type DialogProps } from "../dialog-api";
import { t } from "../../application";
import { MultiLanguageInputForLanguageString } from "../../components/input/multi-language-input-4-language-string";
import { DialogDetailRow } from "../../components/dialog/dialog-detail-row";
import { ValidationMessage } from "../association-profile/components/validation-message";
import { InputIri } from "../class/components/input-iri";
import { useEditClassDialogController } from "../class/edit-class-dialog-controller";
import { EditSuperNodeDialogState, useEditSuperNodeDialogController } from "./edit-super-node-dialog-controller";

export const EditSuperNodeDialog = (props: DialogProps<EditSuperNodeDialogState>) => {
  const controller = useEditSuperNodeDialogController(props);
  const state = props.state;
  // TODO RadStr: Localization
  return (
    <>
      <div className="grid bg-slate-100 md:grid-cols-[25%_75%] md:gap-y-3 md:pl-8 md:pr-16 md:pt-2">
        <DialogDetailRow detailKey={t("create-class-dialog.name")} className="text-xl">
          <MultiLanguageInputForLanguageString
            ls={state.name}
            setLs={controller.setName}
            defaultLang={state.language}
            inputType="text"
          />
        </DialogDetailRow>
        <DialogDetailRow detailKey="Name of referenced visual model">
          <MultiLanguageInputForLanguageString
            ls={state.referencedModelName}
            setLs={controller.setReferencedModelName}
            defaultLang={state.language}
            inputType="textarea"
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
      <button onClick={(_) => controller.openChangeReferencedVisualModel()}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded">Change referenced visual model</button>
    </>
  );
};
