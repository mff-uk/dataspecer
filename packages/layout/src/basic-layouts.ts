import { ExtractedModels, LayoutAlgorithm, extractModelObjects } from "./layout-iface";
import { SemanticModelEntity, isSemanticModelClass, isSemanticModelRelationship, isSemanticModelGeneralization } from "@dataspecer/core-v2/semantic-model/concepts";
import { ConstraintContainer } from "./configs/constraint-container";
import { NodeDimensionQueryHandler } from ".";
import { GraphClassic, GraphFactory, IGraphClassic, IMainGraphClassic, MainGraphClassic, VisualNodeComplete } from "./graph-iface";
import _ from "lodash";
import { VisualEntities } from "./migration-to-cme-v2";
import { EntityModel } from "@dataspecer/core-v2";
import { VISUAL_NODE_TYPE, VisualNode } from "@dataspecer/core-v2/visual-model";


/**
 * Layout nodes of given graph using custom made random layout algorithm.
 */
export async function doRandomLayoutAdvancedFromGraph(graph: IGraphClassic, shouldCreateNewGraph: boolean): Promise<IMainGraphClassic> {
    // TOOD: Maybe this should be like "super", because it is always the same - if I want to create new graph then I create copy and change this graph instead of the old one
    //       Here I do it in place, normally this would be called in the Transformer before conversion from the library representation to the graph representation.
    if(shouldCreateNewGraph) {
        graph = _.cloneDeep(graph);
    }
    const classNodes = Object.values(graph.nodes).filter(node => !node.isDummy);
    classNodes.forEach(classNode => {
        let visualNode: VisualNode;
        // TODO; I think that the undefined check will be unnecessary later, once we initialize vis entity in graph instead when converting back
        if(classNode?.completeVisualNode?.isAnchored === true) {
            visualNode = classNode.completeVisualNode.coreVisualNode;
        }
        else {
            classNode.completeVisualNode.setPositionInCoreVisualNode(Math.ceil(Math.random() * 400 * Math.sqrt(classNodes.length)),
                                                                     Math.ceil(Math.random() * 250 * Math.sqrt(classNodes.length)));
        }

    });
    return graph.mainGraph;     // TODO: !!! Well should it be mainGraph or not? what should we do if we want to layout only part of the graph - only the given argument?
}


/**
 * The run method of this class performs random layout of prepared graph.
 */
export class RandomLayout implements LayoutAlgorithm {
    // TODO: This is cool and all but 2 problems:
    //       1) Working with extractedModel and I store it in the prepare method, think about it if I shouldn't work with the graph instead (but this is kinda special case)
    //       2) Doesn't enforce Constraints from constraintContainer
    /**
     * @deprecated
     */
    prepare(extractedModels: ExtractedModels, constraintContainer: ConstraintContainer, nodeDimensionQueryHandler: NodeDimensionQueryHandler): void {
        this.extractedModels = extractedModels;
        this.graph = GraphFactory.createMainGraph(null, extractedModels, null, null);
        this.constraintContainer = constraintContainer;
        // TODO: Deprecated for good
        // this.nodeDimensionQueryHandler = nodeDimensionQueryHandler;
    }

    prepareFromGraph(graph: IGraphClassic, constraintContainer: ConstraintContainer): void {
        this.graph = graph;
        this.constraintContainer = constraintContainer;
    }

    runGeneralizationLayout(shouldCreateNewGraph: boolean): Promise<IMainGraphClassic> {
        throw new Error("TODO: Implement me if necessary");
    }
    run(shouldCreateNewGraph: boolean): Promise<IMainGraphClassic> {
        return doRandomLayoutAdvancedFromGraph(this.graph, shouldCreateNewGraph);
    }
    stop(): void {
        throw new Error("TODO: Implement me if you want webworkers and parallelization");
    }

    graph: IGraphClassic;
    extractedModels: ExtractedModels;         // TODO: Can remove
    constraintContainer: ConstraintContainer;
}


export interface BlockLayoutOptions {
    colCount: number,
    rowJump: number,
    colJump: number
}

/**
 * Puts nodes into block
 * @deprecated
 */
export async function doBlockLayout(inputSemanticModels: Map<string, EntityModel>, options: BlockLayoutOptions): Promise<VisualEntities> {
    const { entities, classes, classesProfiles, relationships, relationshipsProfiles, generalizations } = extractModelObjects(inputSemanticModels);

    let currRow: number = 0;
    let currCol: number = -1;

    const visualEntities = classes.map(cls => {
        currCol++;
        if (currCol % options.colCount == 0) {
            currCol = 0;
            currRow++;
        }

        return {
            identifier: Math.random().toString(36).substring(2),
            type: ["visual-entity"],
            representedEntity: cls.sourceEntityModelIdentifier,
            model: Object.values(inputSemanticModels)[0].getId(),
            position: {
                x: currCol * options.colJump,
                y: currRow * options.rowJump,
                anchored: null
            },
            content: [],
            visualModels: [],
        } as VisualNode
    });

    return Object.fromEntries(visualEntities.map(entity => [entity.representedEntity, entity])) as VisualEntities;
}
