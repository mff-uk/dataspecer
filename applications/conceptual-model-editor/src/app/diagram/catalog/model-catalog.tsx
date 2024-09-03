import { useModelGraphContext } from "../context/model-context";
import { ModelItemRow } from "./components/model-item-row";
import { useActions } from "../action/actions-react-binding";
import { t } from "../application/";

export const ModelCatalog = () => {
    const { models } = useModelGraphContext();
    const actions = useActions();

    const onOpenCreateModelDialog = actions.openCreateModelDialog;

    return (
        <>
            <div>
                <ul>
                    {[...models.keys()].map((modelId, index) => (
                        <li key={"model" + index.toString()}>
                            <ModelItemRow modelId={modelId} />
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
        </>
    );
};
