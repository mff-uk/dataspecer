import { QueryParamsContextType } from "../context/query-params-context";
import { ModelGraphContextType } from "../context/model-context";


export function changeVisualModelAction (
  graph: ModelGraphContextType,
  queryParamsContext: QueryParamsContextType,
  viewIdentifier: string | null
) {
  const activeViewId = graph.aggregatorView.getActiveViewId();
  graph.aggregatorView.changeActiveVisualModel(viewIdentifier);
  graph.setAggregatorView(graph.aggregator.getView());
  queryParamsContext.updateViewId(activeViewId ?? null);
};
