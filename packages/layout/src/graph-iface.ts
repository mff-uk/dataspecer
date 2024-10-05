import { SemanticModelClass, SemanticModelEntity, SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { SemanticModelClassUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { ExtractedModel, extractModelObjects, getEdgeSourceAndTargetGeneralization, getEdgeSourceAndTargetRelationship, getEdgeSourceAndTargetRelationshipUsage } from "./layout-iface";

import { VisualEntity } from "@dataspecer/core-v2/visual-model";

interface Graph {
    getNodes(): INode,
    filterNodes(filterFunction): INode,
    addNodes(nodes): boolean,
    removeNodes(nodes): boolean,
    addEdges(node, edges): boolean,
    putEdges(node, edges): boolean,
    getEdges(node): INode[],
    performActionOnNodes(action): void,
}

export interface IVisualEntityComplete {
    coreVisualEntity: VisualEntity,
    width: number,
    height: number,
}

export class VisualEntityComplete implements IVisualEntityComplete {
    coreVisualEntity: VisualEntity;
    width: number;
    height: number;

    constructor(coreVisualEntity: VisualEntity, width: number, height: number) {
        this.coreVisualEntity = coreVisualEntity;
        this.width = width;
        this.height = height;
    }
}

// TODO: Remove later, was just testing typing in typescript
export interface IGraphIncidenceConstructor {
    new(extractedModel: ExtractedModel): IGraphIncidence
}

export interface IGraphIncidence {
    nodes: Record<string, INode>,
    incidenceMatrix: Record<string, Record<string, IEdgeIncidence>>,
}

// TODO: Remove later, was just testing typing in typescript
interface INodeConstructor {
    new(node: SemanticModelClass | SemanticModelClassUsage): INode
}

interface INode {
    index: number,
    node: SemanticModelEntity,
    isProfile: boolean,
}

interface IEdgeIncidence {
    isProfile: boolean,
    isGeneralization: boolean,
}


// It is probably just better to have Array<Array<IEdgeIncidence>> where IEdgeIncidence also has exists field
// and have somewhere next the mapping of the indices in array to the actual nodes, ie. Record<number, INode>, INode also doesn't need index then
// Such solution takes more memory (actual matrix), but I think it is much easier to use + the access should be a bit faster
// That being said the classical representation should be enough, there is probably no need for this one
export class GraphIncidence implements IGraphIncidence {
    constructor(extractedModel: ExtractedModel) {
        let index: number = 0;
        extractedModel.classes.forEach(cls => {
            this.nodes[cls.id] = {
                index: index, node: cls, isProfile: false
            }
            index++;
        });
        extractedModel.classesProfiles.forEach(cls => {
            this.nodes[cls.id] = {
                index: index, node: (cls as undefined as SemanticModelEntity), isProfile: true
            }
            index++;
        });

        extractedModel.relationships.forEach(r => {
            const [source, target, ...rest] = getEdgeSourceAndTargetRelationship(r);
            this.incidenceMatrix[source] = {};
            this.incidenceMatrix[source][target] = {isProfile: false, isGeneralization: false};
        });

        extractedModel.relationshipsProfiles.forEach(r => {
            const [source, target] = getEdgeSourceAndTargetRelationshipUsage(r);
            this.incidenceMatrix[source] = {};
            this.incidenceMatrix[source][target] = {isProfile: true, isGeneralization: true};
        });

        extractedModel.generalizations.forEach(g => {
            const [source, target] = getEdgeSourceAndTargetGeneralization(g);
            this.incidenceMatrix[source] = {};
            this.incidenceMatrix[source][target] = {isProfile: false, isGeneralization: true};
        });
    }

    nodes: Record<string, INode> = {};
    incidenceMatrix: Record<string, Record<string, IEdgeIncidence>> ={};
}

// TODO: This doesn't really make sense, just have interface IGraph which represents any graph
//       (it will have only methods manipulating with it - addNode, ...)
export interface IGraphClassic {
    nodes: Record<string, INodeClassic>,
    todoDebugExtractedModel: ExtractedModel,
}

export class GraphClassic {
    public constructor(inputModel: Record<string, SemanticModelEntity> | ExtractedModel) {
        // https://stackoverflow.com/questions/46703364/why-does-instanceof-in-typescript-give-me-the-error-foo-only-refers-to-a-ty
        // Just simple check, dont check all elements it is not necessary
        const isExtractedModel = (inputModel as ExtractedModel).entities && (inputModel as ExtractedModel).generalizations;
        const extractedModel = isExtractedModel ? (inputModel as ExtractedModel) : extractModelObjects(inputModel as Record<string, SemanticModelEntity>);
        extractedModel.classes.forEach(c => {
            if(this.nodes[c.id] === undefined) {
                this.nodes[c.id] = new NodeClassic(c, false, extractedModel, this);
            }
        });
        extractedModel.classesProfiles.forEach(cp => {
            if(this.nodes[cp.id] === undefined) {
                // TODO: Careful, if I somehow lose (or don't check) the isProfile info stored inside the node, then I can access the iri, which profiles don't have
                this.nodes[cp.id] = new NodeClassic(cp as undefined as SemanticModelClass, true, extractedModel, this);
            }
        });

        this.todoDebugExtractedModel = extractedModel;
    }
    nodes: Record<string, INodeClassic> = {};
    todoDebugExtractedModel: ExtractedModel;
}

// TODO: Can create more specific interfaces for generalization, etc, which will be extending this one - they will be different in the fields - edge: type and isProfile value
export interface IEdgeClassic {
    graph: IGraphClassic,

    edge: SemanticModelEntity,
    isDummy: boolean,
    isProfile: boolean,

    start: INodeClassic,
    end: INodeClassic
}

class EdgeClassic implements IEdgeClassic {
    constructor(edge: SemanticModelEntity, isProfile: boolean, graph: IGraphClassic, start: INodeClassic, end: INodeClassic) {
        this.graph = graph;
        this.isDummy = false;

        this.isProfile = isProfile;
        this.edge = edge;
        this.start = start;
        this.end = end;
    }

    graph: IGraphClassic;

    edge: SemanticModelEntity;
    isDummy: boolean;
    isProfile: boolean;

    start: INodeClassic;
    end: INodeClassic;
}

export interface INodeClassic {
    node: SemanticModelEntity,
    isDummy: boolean,
    isMainEntity: boolean,
    isProfile: boolean,

    profileEdges: Array<IEdgeClassic>,      // TODO: We are wasting a lot of space by doubling information
    reverseRelationshipEdges: Array<IEdgeClassic>,

    generalizationEdges: Array<IEdgeClassic>,
    reverseGeneralizationEdges: Array<IEdgeClassic>,

    relationshipEdges: Array<IEdgeClassic>,
    reverseProfileEdges: Array<IEdgeClassic>,
    getAllOutgoingEdges(): Generator<IEdgeClassic, string, unknown>,
    getAllIncomingEdges(): Generator<IEdgeClassic, string, unknown>,

    completeVisualEntity: IVisualEntityComplete,

    getAttributes(): SemanticModelRelationship[];
    getSourceGraph(): IGraphClassic;
}

type AddEdgeType = "relationshipEdges" | "generalizationEdges" | "profileEdges";
type ReverseAddEdgeType = "reverseRelationshipEdges" | "reverseGeneralizationEdges" | "reverseProfileEdges";

class NodeClassic implements INodeClassic {
    constructor(node: SemanticModelEntity, isProfile: boolean, extractedModel: ExtractedModel, graph: IGraphClassic) {
        this.graph = graph;
        graph.nodes[node.id] = this;
        this.node = node;
        this.isProfile = isProfile;

        let edgeToAddKey: AddEdgeType = "relationshipEdges"
        let reverseEdgeToAddKey: ReverseAddEdgeType = "reverse" + this.capitalizeFirstLetter(edgeToAddKey) as ReverseAddEdgeType;
        extractedModel.relationships.forEach(r => {
            const [source, target, ...rest] = getEdgeSourceAndTargetRelationship(r);
            if(node.id === source) {
                this.addEdgeInternal(graph, r, target, extractedModel, edgeToAddKey, reverseEdgeToAddKey);
            }
        });

        edgeToAddKey = "generalizationEdges"
        reverseEdgeToAddKey = "reverse" + this.capitalizeFirstLetter(edgeToAddKey);     // ??? Why do I not need to recast here???
        extractedModel.generalizations.forEach(g => {
            const [source, target] = getEdgeSourceAndTargetGeneralization(g);
            if(node.id === source) {
                this.addEdgeInternal(graph, g, target, extractedModel, edgeToAddKey, reverseEdgeToAddKey);
            }
        });

        edgeToAddKey = "profileEdges"
        reverseEdgeToAddKey = "reverse" + this.capitalizeFirstLetter(edgeToAddKey) as ReverseAddEdgeType;
        extractedModel.relationshipsProfiles.forEach(rp => {
            const [source, target] = getEdgeSourceAndTargetRelationshipUsage(rp);
            if(node.id === source) {
                this.addEdgeInternal(graph, rp, target, extractedModel, edgeToAddKey, reverseEdgeToAddKey);
            }
        });

        // TODO: We don't really need the whole thing, we just need the attribute so storing the target of the relationship should be enough !
        this.attributes = extractedModel.attributes.filter(a => {
            const [source, target, ...rest] = getEdgeSourceAndTargetRelationship(a);
            return this.node.id === source;
        });
    }
    getSourceGraph(): IGraphClassic {
        return this.graph;
    }
    getAttributes(): SemanticModelRelationship[] {
        return this.attributes;
    }

    private addEdgeInternal(graph: IGraphClassic,
                            edge: SemanticModelEntity,
                            target: string,
                            extractedModel: ExtractedModel,
                            edgeToAddKey: AddEdgeType,
                            reverseEdgeToAddKey: ReverseAddEdgeType) {
        if(graph.nodes[target] === undefined) {
            // TODO: I think that the issue with scheme.org is generalization which has node http://www.w3.org/2000/01/rdf-schema#Class but it isn't in the model
            // At least I hope it isn't some bigger issue between DataType and rdf-schema
            const targetEntity: SemanticModelEntity = extractedModel.entities.find(e => e.id === target);
            if(targetEntity === undefined) {
                return;
            }
            // TODO: Not ideal performance wise, using find 2 times
            graph.nodes[target] = new NodeClassic(targetEntity,
                                                  extractedModel.classesProfiles.find(cp => cp.id === target) !== undefined,
                                                  extractedModel, graph);
        }

        const edgeClassic: IEdgeClassic = new EdgeClassic(edge, edgeToAddKey === "profileEdges", graph, this, graph.nodes[target]);
        const reverseEdgeClassic: IEdgeClassic = new EdgeClassic(edge, edgeToAddKey === "profileEdges", graph, graph.nodes[target], this);

        this[edgeToAddKey].push(edgeClassic);
        graph.nodes[target][reverseEdgeToAddKey].push(reverseEdgeClassic);
    }

    // https://stackoverflow.com/questions/1026069/how-do-i-make-the-first-letter-of-a-string-uppercase-in-javascript
    private capitalizeFirstLetter(string: string): string {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    graph: IGraphClassic;

    node: SemanticModelEntity;
    isDummy: boolean = false;       // TODO: For now just keep false
    isMainEntity: boolean = false;  // TODO: For now just keep false
    isProfile: boolean;
    completeVisualEntity: IVisualEntityComplete;     // TODO:
    attributes: SemanticModelRelationship[];

    profileEdges: IEdgeClassic[] = [];
    reverseProfileEdges: IEdgeClassic[] = [];

    generalizationEdges: IEdgeClassic[] = [];
    reverseGeneralizationEdges: IEdgeClassic[] = [];

    relationshipEdges: IEdgeClassic[] = [];
    reverseRelationshipEdges: IEdgeClassic[] = [];
    getAllIncomingEdges(): Generator<IEdgeClassic, string, unknown> {
        const internalGenerator = this.getEdgesInternal([this.reverseRelationshipEdges, this.reverseGeneralizationEdges, this.reverseProfileEdges]);
        return internalGenerator;
    }

    getAllOutgoingEdges(): Generator<IEdgeClassic, string, unknown> {
        // Note: I couldn't find out, why can't I just somehow return the internals of the getEdgesInternal function
        // Answer: I just had to remove the * in front of method to say that it just returns the generator and isn't the generator in itself
        const internalGenerator = this.getEdgesInternal([this.relationshipEdges, this.generalizationEdges, this.profileEdges]);
        return internalGenerator;
    }

    private *getEdgesInternal(edgesOfDifferentTypes: Array<Array<IEdgeClassic>>): Generator<IEdgeClassic, string, unknown> {
        for(const edgesOfOneType of edgesOfDifferentTypes) {
            // Note: Can't use forEach because of yield
            for(const e of edgesOfOneType) {
                yield e;
            }
        }

        return "TODO: Konec";       // The actual value doesn't really matter, I just found it interesting that generator can return something different as last element
    }
}
