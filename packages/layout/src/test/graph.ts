import { SemanticModelEntity } from "@dataspecer/core-v2/semantic-model/concepts";
import { GraphClassic, GraphFactory, MainGraphClassic } from "../graph-iface";
import { ExtractedModels } from "../layout-iface";
import { EntityModel } from "@dataspecer/core-v2";


/**
 * @deprecated
 */
export function tryCreateClassicGraph(inputModels: Map<string, EntityModel> | ExtractedModels) {
    // TODO RadStr LAYOUT: ... Deprecated, so just remove

    // console.log("Calling tryCreateClassicGraph");
    // const graph = GraphFactory.createMainGraph("TEST", inputModels, null, null);
    // console.log("OUTPUT GRAPH:");
    // console.log(graph);
}
