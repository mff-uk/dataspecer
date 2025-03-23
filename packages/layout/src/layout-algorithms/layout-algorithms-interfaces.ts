import { SemanticModelEntity } from "@dataspecer/core-v2/semantic-model/concepts";
import { VisualEntities } from "../migration-to-cme-v2";
import { Graph, MainGraph } from "../graph/representation/graph";
import { ConstraintContainer } from "../configs/constraint-container";

export type LayoutMethod = (inputSemanticModel: Record<string, SemanticModelEntity>, options?: object) => Promise<VisualEntities>

/**
 * The object which satisfy this interface can be used for layouting. The codeflow when using the interface is as follows.
 * Call {@link prepareFromGraph} to prepare the layouting algorithm and then call {@link run} to layout based on the preparation.
 * It is also possible to call {@link runGeneralizationLayout} to layout the content the generalization subgraphs.
 */
export interface LayoutAlgorithm {

    /**
     * Prepares the algorithm for future layouting. The future layouting will layout given graph and use given constraints.
     */
    prepareFromGraph: (graph: Graph, constraintContainer: ConstraintContainer) => void,
    /**
     * Runs the layouting algorithm on the graph prepared earlier.
     * @param shouldCreateNewGraph if true then new graph is created, otherwise the one passed in preparation phase is changed in place
     * @returns promise which on resolve returns the layouted graph
     */
    run: (shouldCreateNewGraph: boolean) => Promise<MainGraph>,
    /**
     * Runs the layouting algorithm on the graph prepared earlier. Layouts only the generalizations subgraphs separately.
     * @param shouldCreateNewGraph if true then new graph is created, otherwise the one passed in preparation phase is changed in place
     * @returns promise which on resolve returns the layouted graph
     */
    // TODO: Again this could be generalized that we would layout list of any given subgraphs instead of the generalization subgraphs, so it should be moved one level up and
    //       we should just call layout on the given subgraph
    runGeneralizationLayout: (shouldCreateNewGraph: boolean) => Promise<MainGraph>,
}
