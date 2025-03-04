import { SemanticModelClass, SemanticModelRelationship, isSemanticModelClass } from "@dataspecer/core-v2/semantic-model/concepts";
import { t } from "../../application";
import { SemanticModelClassUsage, SemanticModelRelationshipUsage, isSemanticModelClassUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { useActions } from "../../action/actions-react-binding";
import { SemanticModelClassProfile, SemanticModelRelationshipProfile } from "@dataspecer/core-v2/semantic-model/profile/concepts";
import { useRef } from "react";

export const AddNeighborhoodButton = ({ entity }: {
  entity: SemanticModelClass | SemanticModelRelationship |
    SemanticModelClassUsage | SemanticModelRelationshipUsage  |
    SemanticModelClassProfile | SemanticModelRelationshipProfile
}) => {

  const { addClassNeighborhoodToVisualModel } = useActions();

  const currentlyPerformingShowAction = useRef<boolean>(false);
    const onClick = async () => {
      if(currentlyPerformingShowAction.current) {
        return;
      }
      currentlyPerformingShowAction.current = true;
      await addClassNeighborhoodToVisualModel(entity.id);
      currentlyPerformingShowAction.current = false;
      return Promise.resolve();
    };

  if(!isSemanticModelClass(entity) && !isSemanticModelClassUsage(entity)) {
    return null;
  }

  return (
    <button
      className={"hover:bg-teal-400"}
      title={t("add-neighborhood-button.title")}
      onClick={async () => await onClick()}
    >
            🌎
    </button>
  );
};
