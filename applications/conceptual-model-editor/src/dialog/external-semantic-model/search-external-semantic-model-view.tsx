import { type DialogProps } from "../dialog-api";
import { t } from "../../application";
import { DialogDetailRow } from "../../components/dialog/dialog-detail-row";
import { InputText } from "../components/input-text";
import { SearchExternalSemanticModelState } from "./search-external-semantic-model-state";
import { useSearchExternalSemanticModelController } from "./search-external-semantic-model-controller";

export function SearchExternalSemanticModelDialog(
  props: DialogProps<SearchExternalSemanticModelState>,
) {
  const controller = useSearchExternalSemanticModelController(props);
  const state = props.state;
  return (
    <>
      <div className="grid bg-slate-100 pb-2 md:grid-cols-[25%_75%] md:gap-y-3 md:pl-8 md:pr-16 md:pt-2">
        <DialogDetailRow detailKey={t("search-external-semantic-model-dialog.search")} className="text-xl" >
          <InputText
            value={state.search}
            onChange={controller.setSearch}
          />
        </DialogDetailRow>
      </div>
    </>
  );
};
