import { SemanticModelEntity } from "@dataspecer/core-v2/semantic-model/concepts";
import { VisualEntities } from "../migration-to-cme-v2.ts";
import { Graph, MainGraph } from "../graph/representation/graph.ts";
import { ConfigurationsContainer } from "../configurations/configurations-container.ts";

export type LayoutMethod = (inputSemanticModel: Record<string, SemanticModelEntity>, options?: object) => Promise<VisualEntities>

/**
 * The object which satisfy this interface can be used for layouting. The codeflow when using the interface is as follows.
 * Call {@link prepareFromGraph} to prepare the layouting algorithm and then call {@link run} to layout based on the preparation.
 * It is also possible to call {@link runGeneralizationLayout} to layout the content the generalization subgraphs.
 */
export interface LayoutAlgorithm {

    /**
     * Prepares the algorithm for future layouting. The future layouting will layout given graph conversion actions and user given algorithm configurations.
     */
    prepareFromGraph: (graph: Graph, configurationsContainer: ConfigurationsContainer) => void,
    /**
     * Runs the layouting algorithm on the graph prepared earlier.
     * @returns promise which on resolve returns the layouted graph
     */
    run: () => Promise<MainGraph>,
    /**
     * Runs the layouting algorithm on the graph prepared earlier. Layouts only the generalizations subgraphs separately.
     * @deprecated Not really deprecated, but personally I would not implement this method for any future algorithm,
     *  because layouting of subgraphs doesn't work properly and if somebody wanted to make it work properly it is months of work.
     *  However for elk it works, but as said the results are not that good
     * @returns promise which on resolve returns the layouted graph
     */
    runGeneralizationLayout: () => Promise<MainGraph>,
}
