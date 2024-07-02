import type { EntityModel } from "@dataspecer/core-v2";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { useModelGraphContext } from "../../context/model-context";
import { DialogDetailRow } from "./dialog-detail-row";
import { getModelDisplayName } from "../../util/name-utils";
import { isSemanticModelGeneralization } from "@dataspecer/core-v2/semantic-model/concepts";
import type { EntityDetailSupportedType } from "../../util/detail-utils";
import { getLanguagesForNamedThing } from "../../util/language-utils";

import { t } from "../../application";
import { getModelLabel } from "../../service/model-service";

export const DialogColoredModelHeader = (props: { activeModel: EntityModel | null; style?: string }) => {
    const { aggregatorView } = useModelGraphContext();
    const { activeModel, style } = props;

    return (
        <div
            className={style}
            style={{ backgroundColor: aggregatorView.getActiveVisualModel()?.getColor(activeModel?.getId() ?? "") }}
        >
            <DialogDetailRow detailKey="source model">{getModelDisplayName(activeModel)}</DialogDetailRow>
        </div>
    );
};

export const DialogColoredModelHeaderWithLanguageSelector = (props: {
    style?: string;
    activeModel?: EntityModel;
    viewedEntity: EntityDetailSupportedType;
    currentLanguage: string;
    setCurrentLanguage: (l: string) => void;
}) => {
    const { aggregatorView } = useModelGraphContext();
    const { activeModel, viewedEntity, currentLanguage, setCurrentLanguage, style } = props;

    const langs = isSemanticModelGeneralization(viewedEntity) ? [] : getLanguagesForNamedThing(viewedEntity);

    return (
        <>
            <div
                className={style}
                style={{
                    backgroundColor: aggregatorView.getActiveVisualModel()?.getColor(activeModel?.getId() ?? ""),
                }}
            >
                <div className="mb-2 w-full text-sm">source model: {getModelDisplayName(activeModel)}</div>
                <div>
                    lang:
                    <select
                        name="langs"
                        id="langs"
                        onChange={(e) => setCurrentLanguage(e.target.value)}
                        defaultValue={currentLanguage}
                    >
                        {langs.map((lang) => (
                            <option key={lang} value={lang}>
                                {lang}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </>
    );
};

export const DialogColoredModelHeaderWithModelSelector = (props: {
    activeModel?: string;
    onModelSelected: (mId: string) => void;
    style?: string;
}) => {
    const { aggregatorView, models } = useModelGraphContext();
    const { activeModel, onModelSelected, style } = props;

    const availableModels = Array.from(models.values())
        .filter(model => model instanceof InMemorySemanticModel)
        .map(model => ({
            id: model.getId(),
            label: getModelLabel(model),
        }));

    return (
        <div
            className={style}
            style={{ backgroundColor: aggregatorView.getActiveVisualModel()?.getColor(activeModel ?? "") }}
        >
            <DialogDetailRow detailKey={t("model")}>
                <select
                    className="w-full"
                    name="models"
                    id="models"
                    onChange={(e) => onModelSelected(e.target.value)}
                    defaultValue={activeModel}
                >
                    {availableModels.map(item => (
                        <option key={item.id} value={item.id}>
                            {item.label}
                        </option>
                    ))}
                </select>
            </DialogDetailRow>
        </div>
    );
};
