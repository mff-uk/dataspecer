import { SemanticModelEntity } from "@dataspecer/core-v2/semantic-model/concepts";
import { GraphClassic, GraphFactory, MainGraphClassic } from "../graph-iface";
import { ExtractedModel } from "../layout-iface";

export function tryCreateClassicGraph(inputModel: Record<string, SemanticModelEntity> | ExtractedModel) {
    console.log("Calling tryCreateClassicGraph");
    const graph = GraphFactory.createMainGraph("TEST", inputModel, null, null);
    console.log("OUTPUT GRAPH:");
    console.log(graph);
}