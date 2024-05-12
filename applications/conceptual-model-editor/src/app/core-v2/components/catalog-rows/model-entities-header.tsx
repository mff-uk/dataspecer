import { ReactNode, useEffect, useMemo, useState } from "react";
import { ColorPicker } from "../../features/color-picker";
import { ExpandModelButton } from "../buttons";
import { useModelGraphContext } from "../../context/model-context";
import { randomColorFromPalette, tailwindColorToHex } from "~/app/utils/color-utils";
import { getModelDetails } from "../../util/model-utils";
import { EntityModel } from "@dataspecer/core-v2";

export const useModelEntitiesList = (model: EntityModel) => {
    const [isModelEntitiesListOpen, setIsModelEntitiesListOpen] = useState(true);

    const toggleListOpen = () => {
        setIsModelEntitiesListOpen((prev) => !prev);
    };

    const ModelEntitiesList = (props: { children: ReactNode }) => {
        const { models, aggregatorView } = useModelGraphContext();

        const { activeVisualModel } = useMemo(() => {
            return { activeVisualModel: aggregatorView.getActiveVisualModel() };
        }, [models]);

        const { id: modelId, displayName } = useMemo(() => getModelDetails(model), [models]);

        const [entitiesOfModelKey, setEntitiesOfModelKey] = useState(modelId + activeVisualModel?.getId());
        const [backgroundColor, setBackgroundColor] = useState(activeVisualModel?.getColor(modelId) || "#000001");

        useEffect(() => {
            let color = activeVisualModel?.getColor(modelId);

            if (!color) {
                color = randomColorFromPalette();
                activeVisualModel?.setColor(modelId, color);
            }

            setBackgroundColor(color ?? "#ff00ff");
            setEntitiesOfModelKey(modelId + activeVisualModel?.getId());
        }, [activeVisualModel]);

        const handleSaveColor = (color: string) => {
            console.log(color, activeVisualModel);
            setBackgroundColor(color);
            activeVisualModel?.setColor(modelId, color);
        };

        return (
            <li key={entitiesOfModelKey} style={{ backgroundColor: tailwindColorToHex(backgroundColor) }}>
                <div className="flex flex-row justify-between">
                    <h4>Ⓜ {displayName}</h4>
                    <div className="flex flex-row">
                        <ColorPicker currentColor={backgroundColor} saveColor={handleSaveColor} />
                        <ExpandModelButton isOpen={isModelEntitiesListOpen} onClick={toggleListOpen} />
                    </div>
                </div>
                {isModelEntitiesListOpen && (
                    <ul id={`infinite-scroll-${modelId}`} className="ml-1" key={"entities" + modelId}>
                        {props.children}
                    </ul>
                )}
            </li>
        );
    };

    return {
        ModelEntitiesList,
    };
};
