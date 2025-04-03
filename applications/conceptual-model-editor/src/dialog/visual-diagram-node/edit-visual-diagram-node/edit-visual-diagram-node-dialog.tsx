import { type DialogProps } from "../../dialog-api";
import { t } from "../../../application";
import { MultiLanguageInputForLanguageString } from "../../../components/input/multi-language-input-4-language-string";
import { DialogDetailRow } from "../../../components/dialog/dialog-detail-row";
import {
  EditVisualDiagramNodeDialogState,
  useEditVisualDiagramNodeDialogController
} from "./edit-visual-diagram-node-dialog-controller";

export const EditVisualDiagramNodeDialog = (props: DialogProps<EditVisualDiagramNodeDialogState>) => {
  const controller = useEditVisualDiagramNodeDialogController(props);
  const state = props.state;
  // TODO RadStr: Localization
  return (
    <>
      <div className="grid bg-slate-100 md:grid-cols-[25%_75%] md:gap-y-3 md:pl-8 md:pr-16 md:pt-2">
        <DialogDetailRow detailKey={t("create-visual-diagram-node-dialog.label")} className="text-xl">
          <MultiLanguageInputForLanguageString
            ls={state.label}
            setLs={controller.setLabel}
            defaultLang={state.language}
            inputType="text"
          />
        </DialogDetailRow>
        <DialogDetailRow detailKey={t("create-visual-diagram-node-dialog.model-name")}>
          <MultiLanguageInputForLanguageString
            ls={state.representedVisualModelName}
            setLs={controller.setRepresentedVisualModelName}
            defaultLang={state.language}
            inputType="textarea"
          />
        </DialogDetailRow>
        <DialogDetailRow detailKey={t("create-visual-diagram-node-dialog.description")}>
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
