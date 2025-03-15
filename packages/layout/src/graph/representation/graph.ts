import {
    isSemanticModelGeneralization,
    SemanticModelEntity,
    SemanticModelGeneralization,
    SemanticModelRelationship
} from "@dataspecer/core-v2/semantic-model/concepts";
import {
    AllowedEdgeBundleTypes,
    ExtractedModels,
    extractModelObjects,
    GeneralizationBundle,
    getEdgeSourceAndTargetRelationship,
    RelationshipBundle,
    RelationshipProfileBundle
 } from "../../layout-algorithms/layout-algorithm-interface";

import {
    VisualModel,
    isVisualNode,
    VisualNode,
    isVisualRelationship,
    isVisualProfileRelationship,
    VISUAL_NODE_TYPE,
    isVisualGroup
} from "@dataspecer/core-v2/visual-model";
import {
    getBotRightPosition,
    getTopLeftPosition,
    PhantomElementsFactory,
} from "../../util/utils";
import { LayoutedVisualEntities } from "../../migration-to-cme-v2";
import { EntityModel } from "@dataspecer/core-v2";
import { ExplicitAnchors } from "../../explicit-anchors";
import {
    NodeDimensionQueryHandler,
    ReactflowDimensionsEstimator,
     VisualEntitiesWithOutsiders,
     XY
    } from "../..";
import {
    SemanticModelClassProfile,
} from "@dataspecer/core-v2/semantic-model/profile/concepts";
import { getDomainAndRange } from "@dataspecer/core-v2/semantic-model/relationship-utils";
import { addNodeToGraph, getAllEdges, getAllIncomingEdges, getAllOutgoingEdges, INodeClassic, isNodeInVisualModel, VisualNodeComplete } from "./node";
import { GraphFactory } from "./graph-factory";
import { AllowedEdgeBundleWithType, AllowedEdgeTypes, convertOutgoingEdgeTypeToIncoming, EdgeClassic, EdgeEndPoint, getEdgeTypeNameFromEdge, IEdgeClassic } from "./edge";


/**
 * This is special type for situations, when we want to layout the current visual model, but we also want to find positions for nodes, which are not yet in the visual model,
 * those are stored in {@link outsiders}.
 * Use-case is for example when adding existing class back to canvas. Because if we perform the usual 2 step addition, that is:
 *    1) Add node to visual model together with all its edges
 *    2) Layout visual model
 * Then the node has to be added to some position in step 1), but we move it in step 2). That results in node jumping, which is unwanted behavior.
 *
 * The type could be in future extended with filters against visual model - when we want to layout only part of the visual model.
 * The question for this is if should just completely remove the filtered nodes from graph or set the {@link isConsideredInLayout} variable to false.
 *
 */
export type VisualModelWithOutsiders = {
    /**
     * The visual model.
     */
    visualModel: VisualModel,
    /**
     * Nodes which are not part of the visual model, but should be layouted. The key is the identifier of semantic entity
     */
    outsiders: Record<string, XY | null>,
} | null;

// TODO: This doesn't really make sense, just have interface IGraph which represents any graph
//       (it will have only methods manipulating with it - addNode, ...), so something similiar to interface Graph (at top of the file)
/**
 * Interface which represents the (sub)graph,
 */
export interface IGraphClassic extends INodeClassic {
    layoutOptions: Record<string, string>;

    /**
     * Maps the visual identifier of node to the node.
     */
    nodes: Record<string, EdgeEndPoint>,
    initializeWithGivenContent(
        mainGraph: IMainGraphClassic,
        sourceGraph: IGraphClassic,
        graphIdentifier: string,
        nodeContentOfGraph: Array<EdgeEndPoint> | null,
        isDummy: boolean,
        nodeDimensionQueryHandler?: NodeDimensionQueryHandler | null
    );
    initialize(
        mainGraph: IMainGraphClassic,
        sourceGraph: IGraphClassic,
        graphIdentifier: string,
        inputModels: Map<string, EntityModel> | ExtractedModels | null,
        isDummy: boolean,
        visualModel: VisualModel,
        entitiesToLayout: VisualEntitiesWithOutsiders,
        nodeDimensionQueryHandler?: NodeDimensionQueryHandler | null,
        explicitAnchors?: ExplicitAnchors
    );
    insertSubgraphToGraph(
        subgraph: IGraphClassic,
        nodesInSubgraph: Array<EdgeEndPoint>,
        shouldSplitEdges: boolean
    ): void;
}


/**
 * The reason for this is, that for example d3.js likes to have complete list of nodes and edges stored somewhere. Which is ok, but up until now
 * we extepcted the nodes/edges to be hierarchic - i.e. if there is group node - the graph above it only stores the group node and the content of the group node is
 * available only from the group node and not anywhere else.
 */
export interface IMainGraphClassic extends IGraphClassic {
    /**
     * Maps the semantic node to all its visuals.
     *
     * If the entity does not have semantic equivalent, its visual one is used as a key
     */
    semanticNodeToVisualMap: Record<string, EdgeEndPoint[]>,


    // TODO RadStr: Maybe not needed
    /**
     * Maps the semantic edge to all its visuals.
     *
     * If the entity does not have semantic equivalent, its visual one is used as a key
     */
    semanticEdgeToVisualMap: Record<string, IEdgeClassic[]>,

    /**
     * List of all nodes/subgraphs in the graph.
     */
    allNodes: EdgeEndPoint[],
    /**
     * List of all edges in the graph.
     */
    allEdges: IEdgeClassic[],       // TODO: Kdyz uz mam tyhle edges, tak to potencionalne muzu mit jako mapu a v ramci tech nodu si jen pamatovat ID misto celych objektu, ale je to celkem jedno
                                    //       (+ tohle pak nebude pole, respektvie bych si ho musel ziskavat skrz Object.values)

    nodeDimensionQueryHandler: NodeDimensionQueryHandler;

    // TODO: Maybe map to make it faster
    findNodeInAllNodes(nodeIdentifier: string): EdgeEndPoint | null,
    findEdgeInAllEdges(edgeIdentifier: string): IEdgeClassic | null,
    findNodeIndexInAllNodes(nodeIdentifier: string): number | null,
    findEdgeIndexInAllEdges(edgeIdentifier: string): number | null,
    /**
     * Call this method on the "wrapper" graph to convert all entities within the graph to VisualEntites which can be used in Visual model
     */
    convertWholeGraphToDataspecerRepresentation(): LayoutedVisualEntities,
    /**
     * This method goes through all the nodes, subgraphs and edges inside this graph and sets properties modifying graph to default state - mainly {@link isConsideredInLayout} and reverseInLayout on edges
     */
    resetForNewLayout(): void,


    // TODO: Currently doesn't have reverse operation
    /**
     * Create generalization subgraphs.
     */
    createGeneralizationSubgraphs(): void,
}


/**
 * Class which stores (sub)graph.
 */
export class GraphClassic implements IGraphClassic {
    private initializeGraphMetadata(
        mainGraph: IMainGraphClassic,
        sourceGraph: IGraphClassic,
        graphIdentifier: string,
        isDummy: boolean,
        nodeDimensionQueryHandler: NodeDimensionQueryHandler | null,
    ) {
        this.sourceGraph = sourceGraph;
        if(!(this instanceof MainGraphClassic)) {
            mainGraph.allNodes.push(this);
        }
        else {
            if(nodeDimensionQueryHandler === undefined || nodeDimensionQueryHandler === null) {
                nodeDimensionQueryHandler = new ReactflowDimensionsEstimator();
            }
            this.nodeDimensionQueryHandler = nodeDimensionQueryHandler;
        }
        this.mainGraph = mainGraph;
        this.id = graphIdentifier;
        this.isDummy = isDummy;
        this.sourceModelIdentifier = null;
    }

    initializeWithGivenContent(
        mainGraph: IMainGraphClassic,
        sourceGraph: IGraphClassic,
        graphIdentifier: string,
        nodeContentOfGraph: Array<EdgeEndPoint>,
        isDummy: boolean,
        nodeDimensionQueryHandler: NodeDimensionQueryHandler | null,
    ) {

        this.initializeGraphMetadata(mainGraph, sourceGraph, graphIdentifier, isDummy, nodeDimensionQueryHandler);

        const nodesMap = {};
        for(const node of nodeContentOfGraph) {
            nodesMap[node.id] = node;
            node.setSourceGraph(this);
        }
        this.nodes = nodesMap;
        const visualNodeRepresentingGraph = this.createNewVisualNodeForGraphBasedOnContainedNodes();
        const topLeft = getTopLeftPosition(Object.values(this.nodes));
        const botRight = getBotRightPosition(Object.values(this.nodes));
        const width = botRight.x - topLeft.x;
        const height = botRight.y - topLeft.y;
        visualNodeRepresentingGraph.position = { ...topLeft, anchored: null };
        this.completeVisualNode = new VisualNodeComplete(visualNodeRepresentingGraph, width, height, false, false);
        console.info("this.completeVisualNode representing graph", {cvn: {...this.completeVisualNode}});
    }

    private createNewVisualNodeForGraphBasedOnContainedNodes() {
        const position = getTopLeftPosition(Object.values(this.nodes));
        return {
            identifier: this.id,
            type: [VISUAL_NODE_TYPE],
            representedEntity: this.id,
            position: {
                ...position,
                anchored: null,
            },
            content: [],
            visualModels: [],
            model: "",
        };
    }


    /**
     * Initializes instance of this graph, the reason why this is not part of the constructor is that since {@link MainGraphClassic} extends this class,
     * it uses the same initialize method, that results in situation that we can't update the list of all nodes in the constructor, since they are not initialized.
     */
    initialize(
        mainGraph: IMainGraphClassic,
        sourceGraph: IGraphClassic,
        graphIdentifier: string,
        inputModels: Map<string, EntityModel> | ExtractedModels | null,
        isDummy: boolean,
        visualModel: VisualModel,
        entitiesToLayout: VisualEntitiesWithOutsiders,
        nodeDimensionQueryHandler?: NodeDimensionQueryHandler | null,
        explicitAnchors?: ExplicitAnchors
    ) {

        this.initializeGraphMetadata(mainGraph, sourceGraph, graphIdentifier, isDummy, nodeDimensionQueryHandler);

        if(inputModels === null) {
            return;
        }

        // https://stackoverflow.com/questions/46703364/why-does-instanceof-in-typescript-give-me-the-error-foo-only-refers-to-a-ty
        // Just simple check, dont check all elements it is not necessary
        const areInputModelsExtractedModels = (inputModels as ExtractedModels).entities && (inputModels as ExtractedModels).generalizations;
        const extractedModels = areInputModelsExtractedModels ? (inputModels as ExtractedModels) : extractModelObjects(inputModels as Map<string, EntityModel>);


        console.info("extractedModels");
        console.info(extractedModels);

        this.createGraphNodes(entitiesToLayout, visualModel, extractedModels, explicitAnchors);
        this.createGraphEdges(entitiesToLayout, visualModel, extractedModels);
        this.createGraphGroups(entitiesToLayout, visualModel, extractedModels);

        console.info("THIS GRAPH:", this);
    }

    private createGraphNodes(
        entitiesToLayout: VisualEntitiesWithOutsiders,
        visualModel: VisualModel | null,
        extractedModels: ExtractedModels,
        explicitAnchors?: ExplicitAnchors
    ) {
        if(visualModel !== null) {
            const nodes = entitiesToLayout.visualEntities
                .map(entity => visualModel.getVisualEntity(entity))
                .filter(entity => entity !== null)
                .filter(isVisualNode);
            for(const node of nodes) {
                const cclass = extractedModels.classes.find(cclass => cclass.semanticClass.id === node.representedEntity);
                if(cclass !== undefined) {
                    addNodeToGraph(
                        this.mainGraph, node, cclass.semanticClass, false, cclass.sourceModelIdentifier,
                        extractedModels, this, visualModel, entitiesToLayout, null, explicitAnchors);
                }
                else {
                    const classProfile = extractedModels.classesProfiles
                        .find(classProfile => classProfile.semanticClassProfile.id === node.representedEntity);
                    if(classProfile === undefined) {
                        console.error("Node is neither class or class profile");
                        // TODO RadStr: We do have nodes which don't have semantic equivalent
                        throw new Error("Implementation error")
                        return;
                    }
                    addNodeToGraph(
                        this.mainGraph, node, classProfile.semanticClassProfile, true,
                        classProfile.sourceModelIdentifier, extractedModels, this,
                        visualModel, entitiesToLayout, null, explicitAnchors);
                }
            }
        }

        for(const [outsider, position] of Object.entries(entitiesToLayout.outsiders)) {
            // Basically same as for the visual nodes - so TODO: If time try to refactor into one method
            const cclass = extractedModels.classes.find(cclass => cclass.semanticClass.id === outsider);
            if(cclass !== undefined) {
                addNodeToGraph(
                    this.mainGraph, null, cclass.semanticClass, false, cclass.sourceModelIdentifier,
                    extractedModels, this, visualModel, entitiesToLayout, position, explicitAnchors);
            }
            else {
                const classProfile = extractedModels.classesProfiles
                    .find(classProfile => classProfile.semanticClassProfile.id === outsider);
                if(classProfile === undefined) {
                    console.error("outsider is neither class or class profile");
                    throw new Error("Implementation error")
                    return;
                }
                addNodeToGraph(
                    this.mainGraph, null, classProfile.semanticClassProfile, true,
                    classProfile.sourceModelIdentifier, extractedModels, this,
                    visualModel, entitiesToLayout, position, explicitAnchors);
            }
        }
    }

    /**
     * Expects that the ends of edges to already exist.
     */
    private createGraphEdges(
        entitiesToLayout: VisualEntitiesWithOutsiders,
        visualModel: VisualModel | null,
        extractedModels: ExtractedModels
    ) {
        const sourceGraph = this;           // TODO RadStr: Probably not needed
        if(visualModel !== null) {
            const relationshipEdges = entitiesToLayout.visualEntities
                .map(visualId => visualModel.getVisualEntity(visualId))
                .filter(entity => entity !== null)
                .filter(edge => isVisualRelationship(edge));
            const classProfilesEdges = entitiesToLayout.visualEntities
                .map(visualId => visualModel.getVisualEntity(visualId))
                .filter(entity => entity !== null)
                .filter(edge => isVisualProfileRelationship(edge));

            for(const edge of relationshipEdges) {
                const semanticRelationshipBundle = getSemanticRelationshipBundle(edge.representedRelationship, extractedModels);
                if(semanticRelationshipBundle === undefined || semanticRelationshipBundle === null) {
                    // TODO RadStr: Maybe we don't have to skip it - it might work even without the semantic counter-part
                    console.warn("The visual relationship is not present in the semantic model");
                    continue;
                }

                let semanticRelationship: AllowedEdgeTypes = convertAllowedEdgeBundleToAllowedEdgeType(semanticRelationshipBundle);

                EdgeClassic.addNewEdgeToGraph(
                    sourceGraph, null, edge, semanticRelationship,
                    edge.visualSource, edge.visualTarget,
                    extractedModels, semanticRelationshipBundle.type);
            }
            for(const edge of classProfilesEdges) {
                const semanticClassProfile = getSemanticRelationshipBundle(edge.entity, extractedModels);
                if(semanticClassProfile === undefined) {
                    // TODO RadStr: Maybe we don't have to skip it - it might work even without the semantic counter-part
                    console.warn("The visual relationship is not present in the semantic model");
                    continue;
                }
                EdgeClassic.addNewEdgeToGraph(
                    sourceGraph, null, edge, null,
                    edge.visualSource, edge.visualTarget,
                    extractedModels, "outgoingClassProfileEdges");
            }
        }


        const relationships = extractedModels.relationships
            .filter(relationshipBundle => {
                return checkIfEdgeShouldBePartOfGraph(
                    visualModel,
                    entitiesToLayout,
                    relationshipBundle.semanticRelationship.ends[0].concept,
                    relationshipBundle.semanticRelationship.ends[1].concept);
                }
            )
            .map(relationshipBundle => relationshipBundle.semanticRelationship);

        console.info("relationships", {relationships});
        relationships.forEach((relationship) => {
            const { domain, range } = getDomainAndRange(relationship);
            const semanticStart = domain.concept;
            const semanticEnd = range.concept;
            if(entitiesToLayout.outsiders[semanticStart] === undefined &&       // It was already added
                entitiesToLayout.outsiders[semanticEnd] === undefined) {
                return;
            }

            let visualStarts = this.mainGraph.semanticNodeToVisualMap[semanticStart];
            let visualEnds = this.mainGraph.semanticNodeToVisualMap[semanticEnd];

            for(const visualStart of visualStarts) {
                for(const visualEnd of visualEnds) {
                    EdgeClassic.addNewEdgeToGraph(
                        sourceGraph, null, null, relationship,
                        visualStart.id, visualEnd.id,
                        extractedModels, "outgoingRelationshipEdges");
                }
            }
        });
        //
        const generalizations = extractedModels.generalizations
            .filter(generalizationBundle => {
                return checkIfEdgeShouldBePartOfGraph(
                    visualModel,
                    entitiesToLayout,
                    generalizationBundle.semanticGeneralization.child,
                    generalizationBundle.semanticGeneralization.parent);
                }
            )
            .map(generalizationBundle => generalizationBundle.semanticGeneralization);
        generalizations.forEach((generalization) => {
            const semanticStart = generalization.child;
            const semanticEnd = generalization.parent;
            if(entitiesToLayout.outsiders[semanticStart] === undefined &&       // It was already added
                entitiesToLayout.outsiders[semanticEnd] === undefined) {
                return;
            }

            let visualStarts = this.mainGraph.semanticNodeToVisualMap[semanticStart];
            let visualEnds = this.mainGraph.semanticNodeToVisualMap[semanticEnd];

            for(const visualStart of visualStarts) {
                for(const visualEnd of visualEnds) {
                    EdgeClassic.addNewEdgeToGraph(
                        sourceGraph, null, null, generalization,
                        visualStart.id, visualEnd.id,
                        extractedModels, "outgoingGeneralizationEdges");
                }
            }
        });
        //
        const relationshipsProfiles = extractedModels.relationshipsProfiles
            .filter(relationshipProfileBundle => {
                return checkIfEdgeShouldBePartOfGraph(
                    visualModel,
                    entitiesToLayout,
                    relationshipProfileBundle.semanticRelationshipProfile.ends[0].concept,
                    relationshipProfileBundle.semanticRelationshipProfile.ends[1].concept);
                }
            )
            .map(relationshipProfileBundle => relationshipProfileBundle.semanticRelationshipProfile);
        relationshipsProfiles.forEach((relationshipProfile) => {
            const semanticStart = relationshipProfile.ends[0].concept;
            const semanticEnd = relationshipProfile.ends[1].concept;
            if(entitiesToLayout.outsiders[semanticStart] === undefined &&       // It was already added
                entitiesToLayout.outsiders[semanticEnd] === undefined) {
                return;
            }

            let visualStarts = this.mainGraph.semanticNodeToVisualMap[semanticStart];
            let visualEnds = this.mainGraph.semanticNodeToVisualMap[semanticEnd];

            for(const visualStart of visualStarts) {
                for(const visualEnd of visualEnds) {
                    EdgeClassic.addNewEdgeToGraph(
                        sourceGraph, null, null, relationshipProfile,
                        visualStart.id, visualEnd.id,
                        extractedModels, "outgoingProfileEdges");
                }
            }
        });
        //
        const toClassProfileEdges: {
            source: SemanticModelClassProfile,
            target: string,
        }[] = [];
        for(const classProfileBundle of extractedModels.classesProfiles) {
            for(const profileOf of classProfileBundle.semanticClassProfile.profiling) {
                if(checkIfEdgeShouldBePartOfGraph(
                        visualModel,
                        entitiesToLayout,
                        classProfileBundle.semanticClassProfile.id, profileOf)) {
                    toClassProfileEdges.push({
                        source: classProfileBundle.semanticClassProfile,
                        target: profileOf
                    });
                }
            }
        }
        for(const toClassProfileEdge of toClassProfileEdges) {
            const semanticStart = toClassProfileEdge.source.id;
            const semanticEnd = toClassProfileEdge.target;
            if(entitiesToLayout.outsiders[semanticStart] === undefined &&       // It was already added
                entitiesToLayout.outsiders[semanticEnd] === undefined) {
                return;
            }

            let visualStarts = this.mainGraph.semanticNodeToVisualMap[semanticStart];
            let visualEnds = this.mainGraph.semanticNodeToVisualMap[semanticEnd];

            for(const visualStart of visualStarts) {
                for(const visualEnd of visualEnds) {
                    EdgeClassic.addNewEdgeToGraph(
                        sourceGraph, null, null, null,
                        visualStart.id, visualEnd.id,
                        extractedModels, "outgoingClassProfileEdges");
                }
            }
        }
    }

    private createGraphGroups(
        entitiesToLayout: VisualEntitiesWithOutsiders,
        visualModel: VisualModel | null,
        extractedModels: ExtractedModels
    ) {
        if(visualModel !== null) {
            const groups = entitiesToLayout.visualEntities
                .map(entity => visualModel.getVisualEntity(entity))
                .filter(entity => entity !== null)
                .filter(isVisualGroup);
            for(const group of groups) {
                // TODO RadStr LAYOUT: We will have to write the getTopLevelGroup method again, otherwise this does not work

                const nodesInSubgraph = group.content
                    .map(identifier => this.mainGraph.findNodeInAllNodes(identifier));
                GraphFactory.createGraph(
                    this.mainGraph, this, group.identifier, nodesInSubgraph, true, true);
            }
        }
    }

    private isEdgeInsideGraph(edge: IEdgeClassic): boolean {
        return edge.start.getSourceGraph() === this || edge.end.getSourceGraph() === this;
    }

    public createGeneralizationSubgraphs() {
        const generalizationEdges: SemanticModelGeneralization[] = [];
        this.mainGraph.allEdges.forEach(edge => {
            // TODO: Not sure if it actually has to be inside the graph or it can go beyond
            if(isSemanticModelGeneralization(edge.semanticEntityRepresentingEdge) && this.isEdgeInsideGraph(edge)) {
                generalizationEdges.push(edge.semanticEntityRepresentingEdge);
            }
        })

        // We pass in no visual model, since it is expected that the edges in the graph are exactly those which were at the visual model at the time of creation
        this.createGeneralizationSubgraphsInternal(generalizationEdges, null);
    }



    // TODO: Only reason why we need visualModel is because in the cme-v1 we can't easily tell if generalization is part of the visual model.
    /**
     * Creates generalization subgraphs. The subgraphs are maximal, meaning any node which can be reached through the generalization path is in the subgraph.
     */
    private createGeneralizationSubgraphsInternal(
        generalizationEdges: SemanticModelGeneralization[],
        visualModel: VisualModel
    ): IGraphClassic[] {
        // For now 1 whole hierarchy (n levels) == 1 subgraph
        let parents: Record<string, string[]> = {};
        let children: Record<string, string[]> = {};
        generalizationEdges.forEach(g => {
            if(parents[g.child] === undefined) {
                parents[g.child] = [];
            }
            parents[g.child].push(g.parent);

            if(children[g.parent] === undefined) {
                children[g.parent] = [];
            }
            children[g.parent].push(g.child);
        });

        const subgraphs: string[][] = this.findGeneralizationSubgraphs(parents, children);
        let generalizationSubgraphs: EdgeEndPoint[][] = subgraphs.map(subgraph => {
            // This removes the labels, so it is better to just paste in the original node
            // TODO: Or maybe the copy of it, but for now just paste in the original one
            // return subgraph.map(nodeID => this.createNode(nodeID, true));     // TODO: What about subgraphs inside subgraphs

            // TODO: Expects that that are no subgraphs in children
            // TODO RadStr LAYOUT: - Accessing the first one, that is [0] - which is wrong for multi entities - i guess that jsut iterate through everything using for cycle
            return subgraph.map(nodeID => this.nodes[this.mainGraph.semanticNodeToVisualMap[nodeID][0].id]);
        });

        console.log("Generated subgraphs:");
        console.log(subgraphs);
        console.log(generalizationSubgraphs);
        // TODO: Just as in the relationships (in case of Schema.org) we have to remove the nodes which are not part of model
        // TODO: This is exactly the reason why I need to have my own graph representation as single source of truth - because here I am again
        //       removing nodes which shouldn't be in the graph in the first place, because I already removed them
        generalizationSubgraphs = generalizationSubgraphs.map(subgraph => subgraph.filter(node => node !== undefined));
        console.log(generalizationSubgraphs);


        let createdSubgraphs: Array<IGraphClassic> = [];
        generalizationSubgraphs.forEach(nodesInSubgraph => {
            createdSubgraphs.push(this.createGeneralizationSubgraphAndInsertInGraph(nodesInSubgraph));
        });


        return createdSubgraphs;
    }


    /**
     * Finds generalization subgraphs. The subgraphs are maximal, meaning any node which can be reached through the generalization path is in the subgraph.
     * @param parents is record maps node id to its parents (in the generalization hierarchy)
     * @param children is record maps node id to its children (in the generalization hierarchy)
     * @returns Returns 2D string array representing the subgraphs. So each string[] is one generalization subgraph.
     */
    findGeneralizationSubgraphs(parents: Record<string, string[]>, children: Record<string, string[]>): string[][] {
        let subgraphs: Record<string, number> = {};
        let stack: string[] = [];
        let currSubgraph = -1;

        for(let [child, concreteParents] of Object.entries(parents)) {
            if(subgraphs[child] === undefined) {
                currSubgraph++;
                stack.push(child);
                subgraphs[stack[0]] = currSubgraph;
            }

            while(stack.length > 0) {
                let currNode = stack.pop();
                parents[currNode] = parents[currNode] === undefined ? [] : parents[currNode];
                children[currNode] = children[currNode] === undefined ? [] : children[currNode];
                parents[currNode].concat(children[currNode]).forEach(n => {
                    if(subgraphs[n] === undefined) {
                        subgraphs[n] = currSubgraph;
                        stack.push(n);
                    }
                });
            }
        }
        currSubgraph++;     // So it is the same as number of subgraphs



        let subgraphsAsArrays: string[][] = [];
        for(let i = 0; i < currSubgraph; i++) {
            subgraphsAsArrays.push([]);
        }
        Object.entries(subgraphs).forEach(([nodeID, subgraphID]) => subgraphsAsArrays[subgraphID].push(nodeID));

        return subgraphsAsArrays;
    }



    // We have it as instance method, this way the identifiers are consistent between two graphs
    private subgraphUniqueIdentifier = 0;
    private createUniqueGeneralizationSubgraphIdentifier(): string {
        const identifier = `subgraph-${this.subgraphUniqueIdentifier}`;
        this.subgraphUniqueIdentifier++;

        return identifier;
    }

    /**
     * Creates the generalization subgraph and inserts into this instance of graph
     */
    createGeneralizationSubgraphAndInsertInGraph(nodesInSubgraph: Array<EdgeEndPoint>): IGraphClassic {
        const identifier = this.createUniqueGeneralizationSubgraphIdentifier();
        const subgraph: IGraphClassic = GraphFactory.createGraph(
            this.mainGraph, this, identifier, nodesInSubgraph, true, true);
        return subgraph;
    }

    insertSubgraphToGraph(subgraph: IGraphClassic, nodesInSubgraph: Array<EdgeEndPoint>, shouldSplitEdges: boolean): void {
        // Repair the old graph by substituting the nodes by the newly created subgraph
        this.replaceNodesInOriginalGraphWithTheSubgraph(subgraph, nodesInSubgraph);
        console.log("After changeNodesInOriginalGraph");
        if(shouldSplitEdges) {
            // Repair edges by splitting them into two parts
            this.splitEdgesGoingBeyondSubgraph(subgraph, nodesInSubgraph);
            console.log("After repairEdgesInOriginalGraph");
        }
    }

    /**
     * Replaces the {@link nodesInSubgraph} stored in this instance of graph with one node (respectively graph) which stores them - the {@link subgraph}
     */
    replaceNodesInOriginalGraphWithTheSubgraph(subgraph: IGraphClassic, nodesInSubgraph: Array<EdgeEndPoint>) : void {
        for(const nodeInSubgraph of nodesInSubgraph) {
            delete this.nodes[nodeInSubgraph.id];
        }
        this.nodes[subgraph.id] = subgraph;
    }


    /**
     * Splits edges, the act of splitting is explained the {@link GraphFactory.createGraph}
     */
    splitEdgesGoingBeyondSubgraph(subgraph: IGraphClassic, changedNodes: Array<EdgeEndPoint>): void {
        this.splitEdgesGoingBeyondSubgraphInternal(subgraph, changedNodes, "sources");
        this.splitEdgesGoingBeyondSubgraphInternal(subgraph, changedNodes, "targets");
    }


    /**
     *
     * @param edgeEnd is either "sources" or "targets", if it is sources then it repairs edges going out of subgraph, "targets" then going in
     */
    private splitEdgesGoingBeyondSubgraphInternal(subgraph: IGraphClassic, changedNodes: Array<EdgeEndPoint>, edgeEnd: "sources" | "targets") {
        console.log("START OF repairEdgesGoingBeyondSubgraphInternal");
        console.log(subgraph.mainGraph);

        const edgesGoingBeyond: IEdgeClassic[] = [];

        const nodesInsideSubgraph = changedNodes.concat(subgraph);
        if(edgeEnd === "sources") {
            changedNodes.forEach(node => {
                console.info("sources");
                console.info([...node.getAllOutgoingEdges()]);
                for(const edge of node.getAllOutgoingEdges()) {
                    if(nodesInsideSubgraph.find(changedNode => changedNode.id === edge.end.id) === undefined) {
                        edgesGoingBeyond.push(edge);
                    }
                }
            });
        }
        else if(edgeEnd === "targets") {
            changedNodes.forEach(node => {
                console.info("targets");
                console.info([...node.getAllOutgoingEdges()]);
                for(const edge of node.getAllIncomingEdges()) {
                    if(nodesInsideSubgraph.find(changedNode => changedNode.id === edge.start.id) === undefined) {
                        edgesGoingBeyond.push(edge);
                    }
                }
            });
        }

        console.log("BEFORE GOING TO splitEdgeIntoTwo");
        console.log(edgesGoingBeyond);

        // TODO: Actually ... should visual model contain ports?? And should I have them here in my representation????!!!
        edgesGoingBeyond.forEach(e => this.splitEdgeIntoTwo(e, subgraph));
    }

    /**
     * Performs the edge splitting - Constructs identifiers of the new edges, removes the old one and creates two new ones.
     * One going from the start node to the subgraph and the other from the subgraph to the other end.
     */
    splitEdgeIntoTwo(edge: IEdgeClassic, subgraph: IGraphClassic): void {
        this.removeEdge(edge);
        const firstSplitIdentifier = PhantomElementsFactory.constructSplitID(edge.id, 0);
        const secondSplitIdentifier = PhantomElementsFactory.constructSplitID(edge.id, 1);

        EdgeClassic.addNewEdgeToGraph(
            subgraph, firstSplitIdentifier, null, edge.semanticEntityRepresentingEdge, edge.visualEdge.visualEdge.visualSource,
            subgraph.id, null, getEdgeTypeNameFromEdge(edge));
        EdgeClassic.addNewEdgeToGraph(
            subgraph, secondSplitIdentifier, null, edge.semanticEntityRepresentingEdge, subgraph.id,
            edge.visualEdge.visualEdge.visualTarget, null, getEdgeTypeNameFromEdge(edge));
    }


    /**
     * Removes given edge from nodes on both ends and also removes it from list of all edges of the main graph.
     */
    removeEdge(edge: IEdgeClassic) {
        const edgeType = getEdgeTypeNameFromEdge(edge);
        const reverseEdgeType = convertOutgoingEdgeTypeToIncoming(edgeType);

        let index = edge.start[edgeType].indexOf(edge);
        edge.start[edgeType].splice(index, 1);
        index = edge.end[reverseEdgeType].indexOf(edge);
        edge.end[reverseEdgeType].splice(index, 1);

        // TODO: Put into separate method ... probably should be just method on the main graph which gets graph as argument
        index = this.mainGraph.findEdgeIndexInAllEdges(edge.id);
        this.mainGraph.allEdges.splice(index, 1);
    }


    convertToDataspecerRepresentation(): VisualNode | null {
        return this.completeVisualNode?.coreVisualNode ?? null;
    }


    nodes: Record<string, EdgeEndPoint> = {};

    sourceGraph: IGraphClassic;
    mainGraph: IMainGraphClassic;

    id: string = "";
    sourceModelIdentifier: string | null;
    semanticEntityRepresentingNode: SemanticModelEntity | null = null;
    isDummy: boolean = true;
    isMainEntity: boolean = false;
    isProfile: boolean = false;
    isConsideredInLayout: boolean = true;     // TODO: Create setter/getter instead (iface vs class ... this will need change on lot of places)
    layoutOptions: Record<string, string> = {};


    setOutgoingClassProfileEdge(outgoingClassProfileEdge: IEdgeClassic) {
        throw new Error("Graphs can't be profiled.");
    }

    outgoingClassProfileEdges: Array<IEdgeClassic> = [];
    incomingClassProfileEdges: Array<IEdgeClassic> = [];

    outgoingRelationshipEdges: Array<IEdgeClassic> = [];
    incomingRelationshipEdges: Array<IEdgeClassic> = [];

    outgoingGeneralizationEdges: Array<IEdgeClassic> = [];
    incomingGeneralizationEdges: Array<IEdgeClassic> = [];

    outgoingProfileEdges: Array<IEdgeClassic> = [];
    incomingProfileEdges: Array<IEdgeClassic> = [];
    getAllIncomingEdges(): Generator<IEdgeClassic, string, unknown> {
        return getAllIncomingEdges(this);
    }

    getAllOutgoingEdges(): Generator<IEdgeClassic, string, unknown> {
        return getAllOutgoingEdges(this);
    }

    getAllEdges(): Generator<IEdgeClassic, string, unknown> {
        return getAllEdges(this);
    }

    completeVisualNode: VisualNodeComplete;

    getAttributes(): SemanticModelRelationship[] {
        return [];
    }
    getSourceGraph(): IGraphClassic | null {
        return this.sourceGraph;
    }
    setSourceGraph(sourceGraph: IGraphClassic): void {
        this.sourceGraph = sourceGraph;
    }
}


export class MainGraphClassic extends GraphClassic implements IMainGraphClassic {
    semanticNodeToVisualMap: Record<string, EdgeEndPoint[]> = {};
    semanticEdgeToVisualMap: Record<string, IEdgeClassic[]> = {};
    allNodes: EdgeEndPoint[] = [];
    allEdges: IEdgeClassic[] = [];
    nodeDimensionQueryHandler: NodeDimensionQueryHandler;

    findNodeInAllNodes(nodeIdentifier: string): EdgeEndPoint | null {
        return this.allNodes.find(node => node.id === nodeIdentifier);
    }
    findEdgeInAllEdges(edgeIdentifier: string): IEdgeClassic | null {
        return this.allEdges.find(edge => edge?.id === edgeIdentifier);
    }

    findNodeIndexInAllNodes(nodeIdentifier: string): number | null {
        const index = this.allNodes.findIndex(node => node.id === nodeIdentifier);
        return (index < 0) ? null : index;
    }
    findEdgeIndexInAllEdges(edgeIdentifier: string): number | null {
        const index = this.allEdges.findIndex(edge => edge?.id === edgeIdentifier);
        return (index < 0) ? null : index;
    }

    resetForNewLayout(): void {
        this.allNodes.forEach(node => {
            node.isConsideredInLayout = true;
        });

        this.allEdges.forEach(edge => {
            edge.reverseInLayout = false;
            edge.isConsideredInLayout = true;
        })
    }

    convertWholeGraphToDataspecerRepresentation(): LayoutedVisualEntities {
        const visualEntities: LayoutedVisualEntities = {};

        for(const node of this.allNodes) {
            if(node.isDummy) {
                continue;
            }

            const visualEntityForNode = node.convertToDataspecerRepresentation();

            // visualEntities[node.id] = visualEntityForNode;           // TODO: In future these 2 lines should be equivalent
            visualEntities[visualEntityForNode.identifier] = {
                visualEntity: visualEntityForNode,
                isOutsider: node.completeVisualNode.isOutsider
            };
        }

        for(const edge of this.allEdges) {
            if(edge.isDummy) {
                continue;
            }

            const visualEntityForEdge = edge.convertToDataspecerRepresentation();
            // TODO: Just in case look-up if not set, but I think that in current version this never occurs, we always have the visual node to use
            if(visualEntityForEdge.visualSource === "") {
                const sourceGraphNode = this.findNodeInAllNodes(edge.start.id);
                visualEntityForEdge.visualSource = sourceGraphNode.completeVisualNode.coreVisualNode.identifier;
            }
            if(visualEntityForEdge.visualTarget === "") {
                const targetGraphNode = this.findNodeInAllNodes(edge.end.id);
                visualEntityForEdge.visualTarget = targetGraphNode.completeVisualNode.coreVisualNode.identifier;
            }
            // visualEntities[edge.id] = visualEntityForEdge;           // TODO: In future these 2 lines should be equivalent
            visualEntities[visualEntityForEdge.identifier] = {
                visualEntity: visualEntityForEdge,
                isOutsider: edge.visualEdge.isOutsider,
            };
        }

        return visualEntities;
    }
}


function convertAllowedEdgeBundleToAllowedEdgeType(
    bundle: AllowedEdgeBundleWithType
): AllowedEdgeTypes {
    if(bundle.type === "outgoingRelationshipEdges") {
        return (bundle.semanticRelationship as RelationshipBundle).semanticRelationship;
    }
    else if(bundle.type === "outgoingGeneralizationEdges") {
        return (bundle.semanticRelationship as GeneralizationBundle).semanticGeneralization;
    }
    else if(bundle.type === "outgoingProfileEdges") {
        return (bundle.semanticRelationship as RelationshipProfileBundle).semanticRelationshipProfile;
    }
    return null;
}

/**
 * @returns Returns the semantic relationship - if null is returned then the relationship simply does not exist at all
 * (it is not even class profile like relationship)
 */
function getSemanticRelationshipBundle(
    identifier: string,
    extractedModels: ExtractedModels,
): AllowedEdgeBundleWithType | null {
    let semanticRelationship: AllowedEdgeBundleTypes;

    semanticRelationship = extractedModels.relationships.find(rBundle => rBundle.semanticRelationship.id === identifier);
    if(semanticRelationship !== undefined) {
        return {
            semanticRelationship,
            type: "outgoingRelationshipEdges",
        };
    }

    semanticRelationship = extractedModels.generalizations.find(gBundle => gBundle.semanticGeneralization.id === identifier);
    if(semanticRelationship !== undefined) {
        return {
            semanticRelationship,
            type: "outgoingGeneralizationEdges",
        };
    }

    semanticRelationship = extractedModels.relationshipsProfiles.find(rpBundle => rpBundle.semanticRelationshipProfile.id === identifier);
    if(semanticRelationship !== undefined) {
        return {
            semanticRelationship,
            type: "outgoingProfileEdges",
        };
    }

    semanticRelationship = extractedModels.classesProfiles.find(cpBundle => cpBundle.semanticClassProfile.id === identifier);
    if(semanticRelationship !== undefined) {
        return {
            semanticRelationship,
            type: "outgoingClassProfileEdges",
        };
    }

    return null;
}

/**
 * @returns Returns true if either both ends are outsiders or at one is outsider and the other one is in visual model.
 */
const checkIfEdgeShouldBePartOfGraph = (
    visualModel: VisualModel,
    entitiesToLayout: VisualEntitiesWithOutsiders,
    start: string,
    end: string
): boolean => {
    return isNodeInVisualModel(visualModel, entitiesToLayout, null, start) &&
            isNodeInVisualModel(visualModel, entitiesToLayout, null, end);
}