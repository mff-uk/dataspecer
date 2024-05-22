import { SemanticModelClass, SemanticModelEntity, SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { SemanticModelClassUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { ExtractedModel, extractModelObjects, getEdgeSourceAndTargetGeneralization, getEdgeSourceAndTargetRelationship, getEdgeSourceAndTargetRelationshipUsage } from "./layout-iface";

import { VisualEntity } from "@dataspecer/core-v2/visual-model";

export interface IVisualEntityComplete {
    coreVisualEntity: VisualEntity,
    width: number,
    height: number,
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

export interface INodeClassic {
    node: SemanticModelEntity,
    isDummy: boolean,
    isMainEntity: boolean,
    isProfile: boolean,

    profileEdges: Array<INodeClassic>,
    reverseRelationshipEdges: Array<INodeClassic>,

    generalizationEdges: Array<INodeClassic>,
    reverseGeneralizationEdges: Array<INodeClassic>,

    relationshipEdges: Array<INodeClassic>,
    reverseProfileEdges: Array<INodeClassic>,
    getAllOutgoingEdges(): Generator<INodeClassic, string, unknown>,
    getAllIncomingEdges(): Generator<INodeClassic, string, unknown>,

    completeVisualEntity: IVisualEntityComplete,

    computeWidth(): number,
    computeHeight(): number;
}

class NodeClassic implements INodeClassic {
    constructor(node: SemanticModelEntity, isProfile: boolean, extractedModel: ExtractedModel, graph: IGraphClassic) {
        this.graph = graph;
        graph.nodes[node.id] = this;
        this.node = node;
        this.isProfile = isProfile;

        let edgeToAddKey = "relationshipEdges"
        let reverseEdgeToAddKey = "reverse" + this.capitalizeFirstLetter(edgeToAddKey);
        extractedModel.relationships.forEach(r => {            
            const [source, target, ...rest] = getEdgeSourceAndTargetRelationship(r);
            if(node.id === source) {
                this.addEdgeInternal(graph, target, extractedModel, edgeToAddKey, reverseEdgeToAddKey);
            }
        });

        edgeToAddKey = "generalizationEdges"
        reverseEdgeToAddKey = "reverse" + this.capitalizeFirstLetter(edgeToAddKey);
        extractedModel.generalizations.forEach(g => {
            const [source, target] = getEdgeSourceAndTargetGeneralization(g);
            if(node.id === source) {
                this.addEdgeInternal(graph, target, extractedModel, edgeToAddKey, reverseEdgeToAddKey);
            }
        });

        edgeToAddKey = "profileEdges"
        reverseEdgeToAddKey = "reverse" + this.capitalizeFirstLetter(edgeToAddKey);
        extractedModel.relationshipsProfiles.forEach(rp => {
            const [source, target] = getEdgeSourceAndTargetRelationshipUsage(rp);
            if(node.id === source) {
                this.addEdgeInternal(graph, target, extractedModel, edgeToAddKey, reverseEdgeToAddKey);
            }
        });

        // TODO: We don't really need the whole thing, we just need the attribute so storing the target of the relationship should be enough !
        this.attributes = extractedModel.attributes.filter(a => { 
            const [source, target, ...rest] = getEdgeSourceAndTargetRelationship(a);            
            return this.node.id === source;
        });
    }

    private addEdgeInternal(graph: IGraphClassic, target: string, extractedModel: ExtractedModel, edgeToAddKey: string, reverseEdgeToAddKey: string) {        
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

        this[edgeToAddKey].push(graph.nodes[target]);
        graph.nodes[target][reverseEdgeToAddKey].push(this);
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

    profileEdges: INodeClassic[] = [];
    reverseProfileEdges: INodeClassic[] = [];

    generalizationEdges: INodeClassic[] = [];
    reverseGeneralizationEdges: INodeClassic[] = [];

    relationshipEdges: INodeClassic[] = [];
    reverseRelationshipEdges: INodeClassic[] = [];
    getAllIncomingEdges(): Generator<INodeClassic, string, unknown> {
        const internalGenerator = this.getEdgesInternal([this.reverseRelationshipEdges, this.reverseGeneralizationEdges, this.reverseProfileEdges]);    
        return internalGenerator;
    }

    getAllOutgoingEdges(): Generator<INodeClassic, string, unknown> {
        // Note: I couldn't find out, why can't I just somehow return the internals of the getEdgesInternal function
        // Answer: I just had to remove the * in front of method to say that it just returns the generator and isn't the generator in itself
        const internalGenerator = this.getEdgesInternal([this.relationshipEdges, this.generalizationEdges, this.profileEdges]);    
        return internalGenerator;
    }

    private *getEdgesInternal(edgesOfDifferentTypes: Array<Array<INodeClassic>>): Generator<INodeClassic, string, unknown> {
        for(const edgesOfOneType of edgesOfDifferentTypes) {
            // Note: Can't use forEach because of yield
            for(const e of edgesOfOneType) {
                yield e;        
            }
        }

        return "TODO: Konec";       // The actual value doesn't really matter, I just found it interesting that generator can return something different as last element
    }

    computeWidth(): number {
        const WIDTH_OF_EMPTY_ATTR = 10;
        // TODO: Not using actual model ID so this is just approximation - whole method is just approximation anyways, so it doesn't matter that much
        const TEST_MODEL_STRING = "https://my-model-7tgfl.iri.todo.com/entities/";      
        const TEST_STRING = TEST_MODEL_STRING + "creepy-office";
        const APPROXIMATION_OF_WIDTH_OF_ONE_CHARACTER = 359 / TEST_STRING.length;
        let maxAtrLength = this.attributes.reduce((currMax, currAttribute) => {
            const [source, target, sourceIndex, targetIndex] = getEdgeSourceAndTargetRelationship(currAttribute);
            return Math.max(currMax, currAttribute.ends[targetIndex].name?.en.length);       // TODO: Just english tag for now
        }, 0);

        // TODO: Doesn't probably work properly when having profile of profile
        // TODO: ?.node for now     
        let iriLen = this.isProfile ? this.graph.nodes[(this.node as unknown as SemanticModelClassUsage).usageOf]?.node.iri.length : this.node.iri.length;        
        // TODO: !!! Default for now - definitely change later
        // TODO: Wait so so profiles also have iri?????
        if(iriLen === undefined) {
            iriLen = this.node.iri.length;
        }
        const MAX_WIDTH = TEST_MODEL_STRING.length * APPROXIMATION_OF_WIDTH_OF_ONE_CHARACTER + 
                          Math.max(iriLen * APPROXIMATION_OF_WIDTH_OF_ONE_CHARACTER,
                                   WIDTH_OF_EMPTY_ATTR + maxAtrLength * APPROXIMATION_OF_WIDTH_OF_ONE_CHARACTER);

        return MAX_WIDTH;

    }

    computeHeight(): number {
        // First attribute has height of 8, the ones after that 20        
        const ATTR_HEIGHT = 20;
        const BASE_HEIGHT = 64;
        const HEIGHT_AFTER_FIRST_ATTRIBUTE = 72;
        const ATTR_COUNT = this.attributes.length >= 5 ? 5 : this.attributes.length - 1;        // At 5 the '...' is added
        if(this.attributes.length === 0) {
            return BASE_HEIGHT;
        }

        const height: number = HEIGHT_AFTER_FIRST_ATTRIBUTE + ATTR_COUNT * ATTR_HEIGHT;
        return height;
    }
}