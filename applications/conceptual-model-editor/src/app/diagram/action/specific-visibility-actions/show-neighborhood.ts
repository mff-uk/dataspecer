import { ClassesContextType } from "../../context/classes-context";
import { ModelGraphContextType } from "../../context/model-context";
import { extendSelection } from "../extend-selection-action";
import { changeSelectionVisibility } from "../selection-actions/change-selection-visibility";

export async function showNodeNeighborhood(nodeIdentifier: string,
                                        graph: ModelGraphContextType,
                                        classes: ClassesContextType | null) {
    const selection = await extendSelection([nodeIdentifier], ["ASSOCIATION"], "ONLY-NON-VISIBLE", null);
    changeSelectionVisibility(selection, graph, classes, true);
}