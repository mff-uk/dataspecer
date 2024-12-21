import { EntityModel } from "@dataspecer/core-v2";
import { useActions } from "../../action/actions-react-binding";
import { t } from "../../application";

export const HideAllClassesFromSemanticModelButton = (props: { semanticModel: EntityModel }) => {
    const {removeEntitiesInSemanticModelFromVisualModel} = useActions();
    const onClick = () => {
        removeEntitiesInSemanticModelFromVisualModel(props.semanticModel);
    }

    return (
        <button className="hover:bg-teal-400" title={t("remove-all-classes-contained-semantic-model-from-visual-model-button.title")} onClick={onClick}>
            🕶️
        </button>
    );
};