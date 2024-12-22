import { EntityModel } from "@dataspecer/core-v2";
import { useActions } from "../../action/actions-react-binding";
import { t } from "../../application";

export const ShowAllClassesFromSemanticModelButton = (props: { semanticModel: EntityModel }) => {
    const {addEntitiesFromSemanticModelToVisualModel} = useActions();
    const onClick = () => {
        addEntitiesFromSemanticModelToVisualModel(props.semanticModel);
    };

    return (
        <button className="hover:bg-teal-400" title={t("show-all-classes-from-semantic-model-to-visual-model-button.title")} onClick={onClick}>
            👁
        </button>
    );
};