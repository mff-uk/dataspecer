import { EntityModel } from "@dataspecer/core-v2";
import { useActions } from "../../action/actions-react-binding";
import { t } from "../../application";
import { useRef } from "react";

export const ShowAllClassesFromSemanticModelButton = (props: { semanticModel: EntityModel }) => {
  const { addEntitiesFromSemanticModelToVisualModel } = useActions();
  const currentlyPerformingShowAction = useRef<boolean>(false);
  const onClick = async () => {
    if(currentlyPerformingShowAction.current) {
      return;
    }
    currentlyPerformingShowAction.current = true;
    await addEntitiesFromSemanticModelToVisualModel(props.semanticModel);
    currentlyPerformingShowAction.current = false;
    return Promise.resolve();
  };

  return (
    <button className="hover:bg-teal-400" title={t("show-all-classes-from-semantic-model-to-visual-model-button.title")} onClick={async () => await onClick()}>
            👁
    </button>
  );
};