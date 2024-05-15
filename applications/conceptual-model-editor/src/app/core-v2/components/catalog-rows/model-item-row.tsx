import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { shortenStringTo } from "../../util/utils";
import { useModelGraphContext } from "../../context/model-context";
import { useEditInput } from "../../components/input/edit-input";
import { ModelTypeIcon } from "../model-type-icon";
import { ColorPicker } from "../../features/color-picker";
import { useEffect, useMemo, useState } from "react";
import { randomColorFromPalette } from "~/app/utils/color-utils";

const ModelName = (props: { displayName: string | null }) => (
    <div className="flex-grow text-nowrap">{props.displayName}</div>
);

export const ModelItemRow = (props: { modelId: string }) => {
    const { models, setModelAlias, setModelIri, removeModelFromModels, aggregatorView } = useModelGraphContext();
    const { EditInput, isEditInputActive, openEditInput } = useEditInput();

    const { modelId } = props;
    const model = models.get(modelId);

    const modelAlias = model?.getAlias();
    const displayName = modelAlias ?? shortenStringTo(modelId);

    const { activeVisualModel } = useMemo(() => {
        return { activeVisualModel: aggregatorView.getActiveVisualModel() };
    }, [models]);

    const [currentColor, setCurrentColor] = useState(activeVisualModel?.getColor(modelId) || "#000001");

    useEffect(() => {
        let color = activeVisualModel?.getColor(modelId);

        if (!color) {
            color = randomColorFromPalette();
            activeVisualModel?.setColor(modelId, color);
        }

        setCurrentColor(color ?? "#ff00ff");
    }, [activeVisualModel]);

    const handleSaveColor = (color: string) => {
        console.log(color, activeVisualModel);
        setCurrentColor(color);
        activeVisualModel?.setColor(modelId, color);
    };

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
                <ColorPicker currentColor={currentColor} saveColor={handleSaveColor} />
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
