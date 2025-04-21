import { DialogProps } from "@/dialog/dialog-api";
import {
  EditVisualDiagramNodeDialogState,
  useEditVisualDiagramNodeDialogController
} from "./edit-visual-diagram-node-dialog-controller";
import { MultiLanguageInputForLanguageString } from "@/components/input/multi-language-input-4-language-string";
import { t } from "@/application";
import { DialogDetailRow } from "@/components/dialog/dialog-detail-row";

export const EditVisualDiagramNodeDialog = (props: DialogProps<EditVisualDiagramNodeDialogState>) => {
  const controller = useEditVisualDiagramNodeDialogController(props);
  const state = props.state;
  return (
    <>
      <div className="grid bg-slate-100 md:grid-cols-[25%_75%] md:gap-y-3 md:pl-8 md:pr-16 md:pt-2">
        <DialogDetailRow detailKey={t("create-visual-diagram-node-dialog.model-name")}>
          <MultiLanguageInputForLanguageString
            ls={state.representedVisualModelName}
            setLs={controller.setRepresentedVisualModelName}
            defaultLang={state.language}
            inputType="textarea"
          />
        </DialogDetailRow>
      </div>
    </>
  );
};
