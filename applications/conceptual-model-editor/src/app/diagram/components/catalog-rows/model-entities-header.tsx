import { type ReactNode, useEffect, useMemo, useState } from "react";
import { ExpandModelButton } from "../buttons";
import { useModelGraphContext } from "../../context/model-context";
import { tailwindColorToHex } from "~/app/utils/color-utils";
import { getModelDetails } from "../../util/model-utils";
import type { EntityModel } from "@dataspecer/core-v2";
import { compareMaps } from "../../util/utils";

const getDefaultColor = () => {
    return "#000069";
};

const getDefaultColor2 = () => {
    return "#000420";
};

const getDefaultColor3 = () => {
    return "#069420";
};
const getDefaultColor4 = () => {
    return "#420000";
};

export const useModelEntitiesList = (model: EntityModel) => {
    const [isModelEntitiesListOpen, setIsModelEntitiesListOpen] = useState(true);

    const toggleListOpen = () => {
        setIsModelEntitiesListOpen((prev) => !prev);
    };

    const ModelEntitiesList = (props: { children: ReactNode }) => {
        const { models, aggregatorView } = useModelGraphContext();

        const { activeVisualModel, modelColors } = useMemo(() => {
            const activeVisualModel = aggregatorView.getActiveVisualModel();
            return {
                activeVisualModel: activeVisualModel,
                modelColors: new Map<string, string>(
                    [...models.keys()].map((mId) => [mId, activeVisualModel?.getColor(mId) ?? getDefaultColor2()])
                ),
            };
        }, [models, aggregatorView]);

        const { id: modelId, displayName } = useMemo(() => getModelDetails(model), []);

        const [backgroundColor, setBackgroundColor] = useState({
            clr: activeVisualModel?.getColor(modelId) || getDefaultColor4(),
            ctr: 0, // FIXME: ugly but didn't see another way to force rerender
        });

        useEffect(() => {
            const callToUnsubscribe = activeVisualModel?.subscribeToChanges(() => {
                setBackgroundColor((prev) => {
                    const newClrs = new Map(
                        [...models.keys()].map((mId) => [mId, activeVisualModel.getColor(mId) ?? getDefaultColor()])
                    );
                    const areSame = compareMaps(newClrs, modelColors);
                    if (!areSame) {
                        // force rerender for hierarchy to change color too
                        const newClr = {
                            clr: activeVisualModel?.getColor(modelId) ?? getDefaultColor3(),
                            ctr: prev.ctr + 1,
                        };
                        // console.log("will rerender?", modelId, newClr);
                        return newClr;
                    }
                    // console.log("not gonna rerender?", modelId);
                    return prev;
                });
            });
            return () => callToUnsubscribe?.();
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [activeVisualModel, models]);

        return (
            <li
                key={modelId + (activeVisualModel?.getId() ?? "") + backgroundColor.ctr.toString()}
                style={{ backgroundColor: tailwindColorToHex(backgroundColor.clr) }}
            >
                <div className="flex flex-row justify-between">
                    <h4>Ⓜ {displayName}</h4>
                    <div className="flex flex-row">
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
