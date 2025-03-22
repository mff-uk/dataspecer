import { ConstraintContainer } from "../../configs/constraint-container";
import { Graph } from "../../graph/representation/graph";

/**
 * This interface defines methods for transformation between our graph representation and layouting library representation.
 */
export interface GraphTransformer {

    /** Expected call flow is as follows:
     * 1) Create graph representation of type {@link Graph}
     * 2) Call this method
     * 3) Perform layouting
     * 4) Update existing graph representation using {@link updateExistingGraphRepresentationBasedOnLibraryRepresentation}
     * (or create new one using {@link convertLibraryToGraphRepresentation}).
     * Created representations already include VisualModel in form of {@link VisualNodeComplete} on nodes
     * or just call {@link convertToDataspecerRepresentation} if you no longer need the graph structure
     */
    convertGraphToLibraryRepresentation(
        graph: Graph,
        shouldSetLayoutOptions: boolean,
        constraintContainer: ConstraintContainer
    ): object,

    /**
     * Converts library graph representation to our graph representation.
     * Creates new graph instance with positions set based on the values in library representation of the graph.
     */
    convertLibraryToGraphRepresentation(
        libraryRepresentation: object | null,
        includeDummies: boolean
    ): Graph,

    /**
     * Update positions of visual entities in our graph representation based on the positions in the layout library graph representation.
     */
    updateExistingGraphRepresentationBasedOnLibraryRepresentation(
        libraryRepresentation: object | null,
        graphToBeUpdated: Graph,
        includeNewVertices: boolean,
        shouldUpdateEdges: boolean
    ): void,
}