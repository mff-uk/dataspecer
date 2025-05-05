import { type DialogProps } from "../../dialog-api";
import { t } from "../../../application";
import { InputLanguageString } from "../../components/input-language-string";
import { DialogDetailRow } from "../../../components/dialog/dialog-detail-row";
import { EditVisualModelDialogState } from "./edit-visual-model-dialog-state";
import { useEditVisualModelDialogController } from "./edit-visual-model-dialog-controller";

export const CreateVisualModelDialogView = (
  props: DialogProps<EditVisualModelDialogState>,
) => {
  const controller = useEditVisualModelDialogController(props);
  const state = props.state;
  return (
    <>
      <div className="grid bg-slate-100 md:grid-cols-[25%_75%] md:gap-y-3 md:pl-8 md:pr-16 md:pt-2">
        <DialogDetailRow detailKey={t("create-visual-model-dialog.label")} className="text-xl">
          <InputLanguageString
            value={state.label}
            onChange={controller.setLabel}
            defaultLanguage={state.language}
            inputType="text"
          />
        </DialogDetailRow>
      </div>
    </>
  );
};
