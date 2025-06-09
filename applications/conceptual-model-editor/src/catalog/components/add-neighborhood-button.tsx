import { SemanticModelClass, SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { t } from "../../application";
import {
  SemanticModelClassUsage,
  SemanticModelRelationshipUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { useActions } from "../../action/actions-react-binding";
import {
  SemanticModelClassProfile,
  SemanticModelRelationshipProfile,
} from "@dataspecer/core-v2/semantic-model/profile/concepts";
import { useRef } from "react";

export const AddNeighborhoodButton = ({ entity }: {
  entity: SemanticModelClass | SemanticModelRelationship |
  SemanticModelClassUsage | SemanticModelRelationshipUsage |
  SemanticModelClassProfile | SemanticModelRelationshipProfile
}) => {

  const { addEntityNeighborhoodToVisualModel } = useActions();

  const currentlyPerformingShowAction = useRef<boolean>(false);
  const onClick = async () => {
    if (currentlyPerformingShowAction.current) {
      return;
    }
    currentlyPerformingShowAction.current = true;
    try {
      await addEntityNeighborhoodToVisualModel(entity.id);
    }
    finally {
      // Just in case put into finally block
      currentlyPerformingShowAction.current = false;
    }
    return Promise.resolve();
  };

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
