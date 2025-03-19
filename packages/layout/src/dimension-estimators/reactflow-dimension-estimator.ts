import { NodeDimensionQueryHandler } from "..";
import { Node } from "../graph/representation/node";
import { getEdgeSourceAndTargetRelationship } from "../layout-algorithms/entity-bundles";
import { ReactflowDimensionsConstantEstimator } from "./constant-dimension-estimator";


/**
 * Sophisticated dimension query handler, which estimates dimensions based node's content.
 */
export class ReactflowDimensionsEstimator implements NodeDimensionQueryHandler {
    getWidth(estimatedNode: Node): number {
        const WIDTH_OF_EMPTY_ATTR = 10;
        // Not using actual model ID so this is just approximation - whole method is just approximation anyways, so it doesn't matter that much
        const TEST_MODEL_STRING = "https://my-model-6d9lx.iri.todo.com/entities/";
        const TEST_STRING = TEST_MODEL_STRING + "PlainState";
        const APPROXIMATION_OF_WIDTH_OF_ONE_CHARACTER = ReactflowDimensionsConstantEstimator.getDefaultWidth() / TEST_STRING.length;
        let maxAtrLength = estimatedNode.getAttributes().reduce((currMax, currAttribute) => {
            const { targetIndex } = getEdgeSourceAndTargetRelationship(currAttribute);
            return Math.max(currMax, currAttribute.ends[targetIndex].name?.en?.length ?? 0);       // TODO: Just english tag for now
        }, 0);



        // Profiles also have IRI so this should always work
        const iri = usePrefixForIri(estimatedNode?.semanticEntityRepresentingNode?.iri ?? null);

        const iriLen = iri?.length ?? 200;
        let maxWidth = Math.max(iriLen * APPROXIMATION_OF_WIDTH_OF_ONE_CHARACTER,
                                WIDTH_OF_EMPTY_ATTR + maxAtrLength * APPROXIMATION_OF_WIDTH_OF_ONE_CHARACTER);
        // If it is not known prefix, then use the the default one used for estimation
        // Note that the prefix part should be probably part of model iri, but currently
        // the prefix part is stored in the iri of entity itself for some of the well-known vocabularies
        if(iri === estimatedNode?.semanticEntityRepresentingNode?.iri) {
            maxWidth += TEST_MODEL_STRING.length * APPROXIMATION_OF_WIDTH_OF_ONE_CHARACTER;
        }

        // Fallback just in case, I don't think it should happen
        if(maxWidth <= 0) {
            ReactflowDimensionsConstantEstimator.getDefaultWidth();
        }
        const minWidth = ReactflowDimensionsConstantEstimator.getMinimumWidth();
        if(maxWidth < minWidth) {
          maxWidth = minWidth;
        }
        return maxWidth;
    }


    getHeight(estimatedNode: Node): number {
      // First attribute has height of 8, the ones after that 20
      const ATTR_HEIGHT = 20;
      const BASE_HEIGHT = ReactflowDimensionsConstantEstimator.getDefaultHeight();
      const HEIGHT_AFTER_FIRST_ATTRIBUTE = 72;

      const ATTR_COUNT = estimatedNode.getAttributes().length - 1;
      if(estimatedNode.getAttributes().length === 0) {
        return BASE_HEIGHT;
      }

      const height: number = HEIGHT_AFTER_FIRST_ATTRIBUTE + ATTR_COUNT * ATTR_HEIGHT;

      // Fallback just in case, I don't think it should happen
      if(height <= 0) {
        ReactflowDimensionsConstantEstimator.getDefaultHeight();
      }
      return height;
    }
}


// TODO PRQuestion: Copy-pasted
// TODO PRQuestion: I Can't access this, since the CME is dependent on layout package not the other way around.
// So either have it here copy-pasted or put somewhere, where it can be accessed
const vocabulary : [string, string][] = [
    ["http://www.w3.org/1999/02/22-rdf-syntax-ns#", "rdf"],
    ["http://www.w3.org/2000/01/rdf-schema#", "rdfs"],
    ["http://purl.org/dc/terms/", "dct"],
    ["https://w3id.org/dsv#", "dsv"],
    ["http://www.w3.org/2002/07/owl#", "owl"],
    ["http://www.w3.org/2004/02/skos/core#", "skos"],
    ["http://www.w3.org/ns/dcat#", "dcat"],
  ];

  /**
   * Given IRI return a prefix or null when no prefix is found.
   */
  export const prefixForIri = (iri: string | null) : string | null => {
    for (const [prefix, shortcut] of vocabulary) {
      if (iri?.startsWith(prefix)) {
        return shortcut;
      }
    }
    return null;
  };

  /**
   * Given an absolute URL replace the absolute part with a prefix.
   * If there is no prefix match, returns the original.
   */
  export const usePrefixForIri = (iri: string | null) : string | null => {
    for (const [prefix, shortcut] of vocabulary) {
      if (iri?.startsWith(prefix)) {
        return shortcut + ":" + iri.substring(prefix.length);
      }
    }
    return iri;
  };
