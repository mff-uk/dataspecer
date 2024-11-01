import { useModelGraphContext } from "../context/model-context";
import { ModelItemRow } from "./model-catalog-row";
import { useActions } from "../action/actions-react-binding";
import { t } from "../application/";

export const ModelCatalog = () => {
    const { models } = useModelGraphContext();
    const actions = useActions();

    const onOpenCreateModelDialog = actions.openCreateModelDialog;

    return (
        <div>
            <ul>
                {[...models.keys()].map((identifier, index) => (
                    <li key={"model" + index.toString()}>
                        <ModelItemRow modelId={identifier} />
                    </li>
                ))}
            </ul>
            <div className="flex flex-row [&>*]:mr-1 justify-between whitespace-nowrap">
                &nbsp;
                <button
                    onClick={onOpenCreateModelDialog}
                    type="button"
                    className="cursor-pointer px-1 disabled:cursor-default disabled:bg-zinc-500"
                >
                    {t("model-catalog.add-vocabulary")}
                </button>
            </div>
        </div>
    );
};
