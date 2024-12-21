import { isSemanticModelClass, SemanticModelClass, SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { t } from "../../application";
import { isSemanticModelClassUsage, SemanticModelClassUsage, SemanticModelRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { useActions } from "../../action/actions-react-binding";

export const AddNeighborhoodButton = ({ entity }: { entity: SemanticModelClass | SemanticModelRelationship | SemanticModelClassUsage | SemanticModelRelationshipUsage }) => {
    if(!isSemanticModelClass(entity) && !isSemanticModelClassUsage(entity)) {
        return null;
    }
    const { addClassNeighborhoodToVisualModel } = useActions();

    return (
        <button
            className={"hover:bg-teal-400"}
            title={t("add-neighborhood-button.title")}
            onClick={() => addClassNeighborhoodToVisualModel(entity.id)}
        >
            🌎
        </button>
    );
};
