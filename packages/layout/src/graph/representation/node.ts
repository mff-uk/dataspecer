import { VISUAL_NODE_TYPE, VisualModel, VisualNode } from "@dataspecer/core-v2/visual-model";
import { addToRecordArray, placePositionOnGrid } from "../../util/utils";
import { IGraphClassic, IMainGraphClassic } from "./graph";
import { SemanticModelEntity, SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { ExtractedModels, getEdgeSourceAndTargetRelationship } from "../../layout-algorithms/layout-algorithm-interface";
import { ExplicitAnchors, VisualEntitiesWithOutsiders, XY } from "../..";
import { isEntityWithIdentifierAnchored } from "../../explicit-anchors";
import { IEdgeClassic } from "./edge";

export type AllowedVisualsForNodes = VisualNode;

/**
 * Represents visual node as in the cme visual model, but with couple of additional fields -
 * {@link width}, {@link height}, {@link isOutsider} and {@link isAnchored}, which is internal anchor,
 * because in some cases we want to anchor nodes which were not originally and anchored and also the other way around.
 * The {@link isOutsider} is used to mark nodes, which were NOT part of given visual model. We have this variable, because sometimes we want to layout nodes
 * which are not (yet) part of the visual model. In case when we didn't have any visual model on input, this property can be safely ignored. (It is always false.)
 */
export class VisualNodeComplete {
    coreVisualNode: VisualNode;
    width: number;
    height: number;
    isAnchored: boolean;
    isOutsider: boolean;

    constructor(
        coreVisualNode: VisualNode,
        width: number,
        height: number,
        useCopyOfCoreVisualNode: boolean,
        isOutsider: boolean,
        isAnchored?: boolean
    ) {
        if(useCopyOfCoreVisualNode) {
            // TODO: Maybe deep copy?
            this.coreVisualNode = {...coreVisualNode};
        }
        else {
            this.coreVisualNode = coreVisualNode;
        }
        this.width = width;
        this.height = height;
        this.isOutsider = isOutsider;
        if(isAnchored === undefined) {
            this.isAnchored = coreVisualNode?.position?.anchored ?? false;
        }
        else {
            this.isAnchored = isAnchored;
        }
    }

    /**
     * Sets the position to given one, and puts the result on grid.
     */
    setPositionInCoreVisualNode(newX: number, newY: number) {
        this.coreVisualNode.position.x = newX;
        this.coreVisualNode.position.y = newY;
        placePositionOnGrid(this.coreVisualNode.position, 10, 10);
    }

    addToPositionInCoreVisualNode(x: number, y: number) {
        const newX = this.coreVisualNode.position.x + x;
        const newY = this.coreVisualNode.position.y + y;
        this.setPositionInCoreVisualNode(newX, newY);
    }
}


/**
 * Interface which represents graph node ... Note that subgraph is also graph node.
 */
export interface INodeClassic {
    /**
     * Reference to the main graph, this node is part of.
     */
    mainGraph: IMainGraphClassic;
    /**
     *  We need {@link id}, because some nodes don't have equivalent in the semantic model or are dummy nodes
     */
    id: string;

    /**
     * is the SemanticModelEntity representing node.
     */
    semanticEntityRepresentingNode: SemanticModelEntity | null;
    isDummy: boolean;
    isMainEntity: boolean;
    isProfile: boolean;

    /**
     * It represents possible classes of which this node is profile of.
     */
    outgoingClassProfileEdges: Array<IEdgeClassic>;
    incomingClassProfileEdges: Array<IEdgeClassic>;

    isConsideredInLayout: boolean;

    layoutOptions: Record<string, string>;

    sourceModelIdentifier: string | null;

    // TODO: I could actually have the following edges stored in Record/Map, where key would be the property name, so for example outgoingRelationshipEdges

    /**
     * The outgoing relationship edges, so the edges, where instance of this node is the source/start.
     */
    outgoingRelationshipEdges: Array<IEdgeClassic>;      // TODO: We are wasting a lot of space by doubling information by storing the edge reverses
    /**
     * The incoming relationship edges, so the edges, where instance of this node is the target/end.
     */
    incomingRelationshipEdges: Array<IEdgeClassic>;

    /**
     * The outgoing generalization edges, so the edges, where instance of this node is the child, i.e. source/start.
     */
    outgoingGeneralizationEdges: Array<IEdgeClassic>;
    /**
     * The incoming generalization edges, so the edges, where instance of this node is the parent, i.e. target/end.
     */
    incomingGeneralizationEdges: Array<IEdgeClassic>;

    /**
     * The outgoing profiled relationship edges, so the edges, where instance of this node is the source/start.
     */
    outgoingProfileEdges: Array<IEdgeClassic>;
    /**
     * The incoming profiled relationship edges, so the edges, where instance of this node is the target/end.
     */
    incomingProfileEdges: Array<IEdgeClassic>;

    /**
     * @returns Returns generator which can be iterated to get edges of all types, where the node is source/start.
     */
    getAllOutgoingEdges(): Generator<IEdgeClassic, string, unknown>;
    /**
     * @returns Returns generator which can be iterated to get edges of all types, where the node is target/end.
     */
    getAllIncomingEdges(): Generator<IEdgeClassic, string, unknown>;
    /**
     * @returns Returns generator which can be iterated to get edges of all types, where the node is either source or target.
     */
    getAllEdges(): Generator<IEdgeClassic, string, unknown>;

    /**
     * The complete visual entity for the node
     */
    completeVisualNode: VisualNodeComplete;

    /**
     * Returns attributes of this node.
     */
    getAttributes(): SemanticModelRelationship[];

    /**
     * Returns the source graph of the node. So the subgraph where the node lies (the most inner one)
     */
    getSourceGraph(): IGraphClassic | null;
    /**
     * Sets the source graph of node to given {@link sourceGraph}
     */
    setSourceGraph(sourceGraph: IGraphClassic) : void;

    convertToDataspecerRepresentation(): VisualNode | null;

}


export class NodeClassic implements INodeClassic {
  constructor(
      mainGraph: IMainGraphClassic,
      visualNode: AllowedVisualsForNodes | null,
      semanticEntityRepresentingNode: SemanticModelEntity | null,
      isProfile: boolean,
      sourceModelIdentifier: string | null,
      extractedModels: ExtractedModels | null,
      sourceGraph: IGraphClassic,
      explicititPosition: XY | null,
      explicitAnchors?: ExplicitAnchors
  ) {
      this.mainGraph = mainGraph;
      this.sourceModelIdentifier = sourceModelIdentifier;

      this.sourceGraph = sourceGraph;
      this.semanticEntityRepresentingNode = semanticEntityRepresentingNode;
      this.isProfile = isProfile;

      if(extractedModels === null) {
          return;
      }


              // TODO: We don't really need the whole thing, we just need the attribute so storing the target of the relationship should be enough !
      //       But we store it all for now.
      this.attributes = extractedModels.attributes.filter(attributesBundle => {
          const {source, target, ...rest} = getEdgeSourceAndTargetRelationship(attributesBundle.semanticRelationship);
          return this.semanticEntityRepresentingNode.id === source;
      }).map(attributeBundle => attributeBundle.semanticRelationship);
      if(visualNode !== null) {
          this.id = visualNode.identifier;
          // Kind of ugly,
          // but the reason why need to do this is because the Reactflow dimension handlers, need the id.
      }
      const width = this.mainGraph.nodeDimensionQueryHandler.getWidth(this);
      const height = this.mainGraph.nodeDimensionQueryHandler.getHeight(this);

      const isOutsider = visualNode === null;
      if(visualNode === null) {
          let isAnchored = false;
          if(explicitAnchors !== undefined) {
              isAnchored = isEntityWithIdentifierAnchored(semanticEntityRepresentingNode.id, explicitAnchors, false);
          }
          const coreVisualNode = NodeClassic.createNewVisualNodeBasedOnSemanticData(
              explicititPosition, this.semanticEntityRepresentingNode.id, this.sourceModelIdentifier);
          this.completeVisualNode = new VisualNodeComplete(coreVisualNode, width, height, false, isOutsider, isAnchored);
      }
      else {
          let isAnchored: boolean = visualNode.position.anchored ?? false;
          if(explicitAnchors !== undefined) {
              isAnchored = isEntityWithIdentifierAnchored(visualNode.identifier, explicitAnchors, isAnchored);
          }

          this.completeVisualNode = new VisualNodeComplete(visualNode, width, height, true, isOutsider, isAnchored);

          if(explicititPosition !== null) {
              this.completeVisualNode.coreVisualNode.position = {
                  ...explicititPosition,
                  anchored: this.completeVisualNode.coreVisualNode.position.anchored
              };
          }
      }
      this.id = this.completeVisualNode.coreVisualNode.identifier;

      sourceGraph.nodes[this.id] = this;
      mainGraph.allNodes.push(this);
      if(semanticEntityRepresentingNode === null) {
          addToRecordArray(this.id, this, this.mainGraph.semanticNodeToVisualMap);
      }
      else {
          addToRecordArray(semanticEntityRepresentingNode.id, this, this.mainGraph.semanticNodeToVisualMap);
      }

      console.info("Created node - constructor", this);
  }

  static createNewVisualNodeBasedOnSemanticData(
      position: XY | null,
      semanticEntityRepresentingNodeIdentifier: string,
      sourceModelIdentifier: string | null
  ) {
      if(position === null) {
          position = {x: 0, y: 0};
      }
      return {
          identifier: Math.random().toString(36).substring(2),
          type: [VISUAL_NODE_TYPE],
          representedEntity: semanticEntityRepresentingNodeIdentifier,
          position: {
              x: position.x,
              y: position.y,
              anchored: null,
          },
          content: [],
          visualModels: [],
          model: sourceModelIdentifier ?? "",
      };
  }

  getSourceGraph(): IGraphClassic {
      return this.sourceGraph;
  }

  setSourceGraph(sourceGraph: IGraphClassic): void {
      this.sourceGraph = sourceGraph;
  }
  getAttributes(): SemanticModelRelationship[] {
      return this.attributes;
  }

  convertToDataspecerRepresentation(): VisualNode | null {
      return this.completeVisualNode?.coreVisualNode ?? null;
  }

  mainGraph: IMainGraphClassic;
  sourceGraph: IGraphClassic;

  id: string;
  sourceModelIdentifier: string | null;

  semanticEntityRepresentingNode: SemanticModelEntity | null;
  isDummy: boolean = false;       // TODO: For now just keep false
  isMainEntity: boolean = false;  // TODO: For now just keep false
  isProfile: boolean;

  completeVisualNode: VisualNodeComplete;
  attributes: SemanticModelRelationship[];
  isConsideredInLayout: boolean = true;

  layoutOptions: Record<string, string> = {};

  outgoingClassProfileEdges: Array<IEdgeClassic> = [];
  incomingClassProfileEdges: Array<IEdgeClassic> = [];

  outgoingProfileEdges: IEdgeClassic[] = [];
  incomingProfileEdges: IEdgeClassic[] = [];

  outgoingGeneralizationEdges: IEdgeClassic[] = [];
  incomingGeneralizationEdges: IEdgeClassic[] = [];

  outgoingRelationshipEdges: IEdgeClassic[] = [];
  incomingRelationshipEdges: IEdgeClassic[] = [];
  getAllIncomingEdges(): Generator<IEdgeClassic, string, unknown> {
      return getAllIncomingEdges(this);
  }

  getAllOutgoingEdges(): Generator<IEdgeClassic, string, unknown> {
      return getAllOutgoingEdges(this);
  }

  getAllEdges(): Generator<IEdgeClassic, string, unknown> {
      return getAllEdges(this);
  }
}


/**
* @returns Returns generator which can be iterated to get edges of all types, where {@link node} is target/end.
*/
export function getAllIncomingEdges(node: INodeClassic): Generator<IEdgeClassic, string, unknown> {
  const internalGenerator = getEdgesInternal([node.incomingRelationshipEdges, node.incomingGeneralizationEdges, node.incomingProfileEdges, node.incomingClassProfileEdges]);
  return internalGenerator;
}


/**
* @returns Returns generator which can be iterated to get edges of all types, where {@link node} is source/start.
*/
export function getAllOutgoingEdges(node: INodeClassic): Generator<IEdgeClassic, string, unknown> {
  // Note: I couldn't find out, why can't I just somehow return the internals of the getEdgesInternal function
  // Answer: I just had to remove the * in front of method to say that it just returns the generator and isn't the generator in itself
  const internalGenerator = getEdgesInternal([node.outgoingRelationshipEdges, node.outgoingGeneralizationEdges, node.outgoingProfileEdges, node.outgoingClassProfileEdges]);
  return internalGenerator;
}

/**
* Internal method to create generator from the given edges of different types.
*/
function *getEdgesInternal(edgesOfDifferentTypes: Array<Array<IEdgeClassic>>): Generator<IEdgeClassic, string, unknown> {
  for(const edgesOfOneType of edgesOfDifferentTypes) {
      // Note: Can't use forEach because of yield
      for(const e of edgesOfOneType) {
          yield e;
      }
  }

  return "TODO: End of generator";       // The actual value doesn't really matter, I just found it interesting that generator can return something different as last element
}

/**
* @returns Returns generator which can be iterated to get edges, where {@link node} is either start or end.
*/
export function *getAllEdges(node: INodeClassic): Generator<IEdgeClassic, string, unknown> {
  const incomingEdges = node.getAllIncomingEdges();
  const outgoingEdges = node.getAllOutgoingEdges();
  yield* incomingEdges;
  yield* outgoingEdges;

  return "TODO: End of both generators";
}


/**
 * @returns Returns true if the node is inside the visual model or
 * if the model is null or if the given {@link classIdentifier} is inside {@link outsiders}.
 */
export const isNodeInVisualModel = (
  visualModel: VisualModel,
  entitiesToLayout: VisualEntitiesWithOutsiders,
  node: AllowedVisualsForNodes | null,
  classIdentifier: string
): boolean => {
  if(visualModel === null) {
      return true;
  }

  const visualEntity = visualModel.getVisualEntityForRepresented(classIdentifier);
  const isPresentInVisualEntitiesToLayout = visualEntity !== null &&
                                              entitiesToLayout.visualEntities.includes(visualEntity.identifier);
  const isPresentInVisualModel = node !== null ||
                                  isPresentInVisualEntitiesToLayout ||
                                  entitiesToLayout.outsiders[classIdentifier] !== undefined;
  return isPresentInVisualModel;
};

export function addNodeToGraph(
    mainGraph: IMainGraphClassic,
    node: AllowedVisualsForNodes | null,
    semanticEntityRepresentingNode: SemanticModelEntity | null,
    isProfile: boolean,
    sourceModelIdentifier: string | null,
    extractedModels: ExtractedModels,
    sourceGraph: IGraphClassic,
    visualModel: VisualModel,
    entitiesToLayout: VisualEntitiesWithOutsiders,
    explicititPosition: XY | null,
    explicitAnchors?: ExplicitAnchors
): boolean {
    if(isNodeInVisualModel(visualModel, entitiesToLayout, node, semanticEntityRepresentingNode.id)) {
        new NodeClassic(
            mainGraph, node, semanticEntityRepresentingNode,
            isProfile, sourceModelIdentifier,
            extractedModels, sourceGraph,
            explicititPosition, explicitAnchors);
        return true;
    }

    return false;
}