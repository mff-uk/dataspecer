import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { shortenStringTo } from "../../util/utils";
import { useModelGraphContext } from "../../context/model-context";
import { useEditInput } from "../../components/input/edit-input";
import { ModelTypeIcon } from "../model-type-icon";

const ModelName = (props: { displayName: string | null }) => (
    <div className="flex-grow text-nowrap">{props.displayName}</div>
);

export const ModelItemRow = (props: { modelId: string }) => {
    const { models, setModelAlias, setModelIri, removeModelFromModels } = useModelGraphContext();
    const { EditInput, isEditInputActive, openEditInput } = useEditInput();

    const model = models.get(props.modelId);

    const modelAlias = model?.getAlias();
    const displayName = modelAlias ?? shortenStringTo(props.modelId);

    const saveAlias = (value: string | null) => {
        if (!model) {
            return;
        }
        console.log("saving new alias", value, " to model ", model);
        setModelAlias(value, model);
    };

    const saveModelIri = (value: string | null) => {
        if (!model || !(model instanceof InMemorySemanticModel)) {
            return;
        }
        console.log("saving new base iri", value, " to model ", model);
        setModelIri(value ?? "", model);
    };

    const handleRemoveButtonClicked = () => {
        removeModelFromModels(props.modelId);
    };

    const handleModifyModelAliasClicked = () => {
        openEditInput(saveAlias, modelAlias ?? undefined, "model alias");
    };

    return (
        <div className="my-2 flex flex-row justify-between">
            <div className="flex flex-grow flex-row overflow-x-clip">
                <div className="mr-2 flex flex-row">
                    <span>Ⓜ</span>
                    <ModelTypeIcon
                        model={model}
                        onClick={(baseIri: string | null) =>
                            openEditInput(saveModelIri, baseIri ?? undefined, "model base iri")
                        }
                    />
                </div>
                {isEditInputActive ? <EditInput /> : <ModelName displayName={displayName} />}
            </div>
            <div className="flex flex-row">
                <button className="hover:shadow-sm" onClick={handleModifyModelAliasClicked}>
                    ✏
                </button>
                <button className="my-auto" onClick={handleRemoveButtonClicked}>
                    🗑️
                </button>
            </div>
        </div>
    );
};
