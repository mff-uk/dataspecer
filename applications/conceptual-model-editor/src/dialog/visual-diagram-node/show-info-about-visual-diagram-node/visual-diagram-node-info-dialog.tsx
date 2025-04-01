import { type DialogProps } from "../../dialog-api";
import { t } from "../../../application";
import { MultiLanguageInputForLanguageString } from "../../../components/input/multi-language-input-4-language-string";
import { DialogDetailRow } from "../../../components/dialog/dialog-detail-row";
import { EditVisualDiagramNodeDialogState, useEditVisualDiagramNodeDialogController } from "../edit-visual-diagram-node/edit-visual-diagram-node-dialog-controller";
import { getLocalizedStringFromLanguageString } from "@/util/language-utils";
import { DialogColoredModelHeaderWithLanguageSelector } from "@/components/dialog/dialog-colored-model-header";
import { useState } from "react";

export const VisualDiagramNodeInfoDialog = (props: DialogProps<EditVisualDiagramNodeDialogState>) => {
  const state = props.state;
  const [language, setCurrentLanguage] = useState<string>(props.state.language);
  const languages = [...new Set([...Object.keys(state.label), ...Object.keys(state.description)])];
  return (
    <>
    <div className="bg-slate-100">
        <div className="flex">
          <div className="ml-auto mr-8">
                      Language:&nbsp;
            <select
              name="langs"
              id="langs"
              className="w-32"
              onChange={(e) => setCurrentLanguage(e.target.value)}
              defaultValue={state.language}
            >
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="grid gap-y-3 bg-slate-100 md:grid-cols-[20%_80%] md:pl-8">
        <DialogDetailRow detailKey={t("visual-diagram-node-info-dialog.label")}>
          {getLocalizedStringFromLanguageString(state.label, language)}
        </DialogDetailRow>
        <DialogDetailRow detailKey={t("visual-diagram-node-info-dialog.representedVisualModelName")}>
          {getLocalizedStringFromLanguageString(state.representedVisualModelName, language)}
        </DialogDetailRow>
        <DialogDetailRow detailKey={t("visual-diagram-node-info-dialog.description")}>
          {getLocalizedStringFromLanguageString(state.description, language)}
        </DialogDetailRow>
      </div>
    </>
  );
};
