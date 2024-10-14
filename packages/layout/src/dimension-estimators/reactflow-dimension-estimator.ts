import { SemanticModelClassUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { NodeDimensionQueryHandler } from "..";
import { INodeClassic } from "../graph-iface";
import { getEdgeSourceAndTargetRelationship } from "../layout-iface";

export class ReactflowDimensionsEstimator implements NodeDimensionQueryHandler {
    getWidth(estimatedNode: INodeClassic): number {
        const WIDTH_OF_EMPTY_ATTR = 10;
        // Not using actual model ID so this is just approximation - whole method is just approximation anyways, so it doesn't matter that much
        const TEST_MODEL_STRING = "https://my-model-7tgfl.iri.todo.com/entities/";
        const TEST_STRING = TEST_MODEL_STRING + "creepy-office";
        const APPROXIMATION_OF_WIDTH_OF_ONE_CHARACTER = 359 / TEST_STRING.length;
        let maxAtrLength = estimatedNode.getAttributes().reduce((currMax, currAttribute) => {
            const [source, target, sourceIndex, targetIndex] = getEdgeSourceAndTargetRelationship(currAttribute);
            return Math.max(currMax, currAttribute.ends[targetIndex].name?.en?.length ?? 0);       // TODO: Just english tag for now
        }, 0);



        // Profiles also have IRI so this should always work
        const iriLen = estimatedNode?.node?.iri?.length ?? 200;
        const MAX_WIDTH = TEST_MODEL_STRING.length * APPROXIMATION_OF_WIDTH_OF_ONE_CHARACTER +
                          Math.max(iriLen * APPROXIMATION_OF_WIDTH_OF_ONE_CHARACTER,
                                   WIDTH_OF_EMPTY_ATTR + maxAtrLength * APPROXIMATION_OF_WIDTH_OF_ONE_CHARACTER);

        return MAX_WIDTH;
    }


    getHeight(estimatedNode: INodeClassic): number {
        // First attribute has height of 8, the ones after that 20
        const ATTR_HEIGHT = 20;
        const BASE_HEIGHT = 64;
        const HEIGHT_AFTER_FIRST_ATTRIBUTE = 72;
        // At 5 the '...' is added ... TODO: No longer true

        const ATTR_COUNT = estimatedNode.getAttributes().length >= 5 ? 5 : estimatedNode.getAttributes().length - 1;
        if(estimatedNode.getAttributes().length === 0) {
            return BASE_HEIGHT;
        }

        const height: number = HEIGHT_AFTER_FIRST_ATTRIBUTE + ATTR_COUNT * ATTR_HEIGHT;
        return height;
    }
}
