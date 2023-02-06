import {Bikeshed,} from "../bikeshed-model";
import {BikeshedAdapterContext,} from "./bikeshed-adapter-context";
import {conceptualModelToBikeshedContent} from "./bikeshed-adapter-conceptual";
import {DataSpecification, DataSpecificationDocumentation,} from "@dataspecer/core/data-specification/model";
import {assertNot} from "@dataspecer/core/core";
import {BikeshedConfiguration} from "../bikeshed-configuration";
import {filterByStructural} from "@dataspecer/core/conceptual-model/transformation/filter-by-structural";
import {createBikeshedStructureSection} from "./bikeshed-adapter-structural";
import {createBikeshedMetadata} from "./bikeshed-adapter-metadata";

/**
 * Main function that takes the specification and generates the Bikeshed documentation object.
 */
export async function specificationToBikeshed(
  context: BikeshedAdapterContext & BikeshedConfiguration,
  artefact: DataSpecificationDocumentation,
  specification: DataSpecification
): Promise<Bikeshed> {
  const generatorContext = context.generatorContext;
  let conceptualModel = generatorContext.conceptualModels[specification.pim];
  assertNot(
    conceptualModel === undefined,
    `Missing conceptual model ${specification.pim}.`
  );

  const structureModels = specification.psms.map(psm => generatorContext.structureModels[psm]);
  conceptualModel = filterByStructural(conceptualModel, structureModels);

  const result = new Bikeshed();

  // First part: Create metadata
  result.metadata = createBikeshedMetadata(context, conceptualModel);

  // Second part: Create conceptual model content
  result.content.push(
    await conceptualModelToBikeshedContent(
      context,
      specification,
      artefact,
      conceptualModel
    )
  );

  // Third part: Create structure model content
  for (const iri of specification.psms) {
    const structureModel = context.generatorContext.structureModels[iri];
    assertNot(structureModel === null, `Missing model '${iri}'.`);
    const structureDocumentation = await createBikeshedStructureSection(
      context,
      artefact,
      specification,
      conceptualModel,
      structureModel
    );
    result.content.push(structureDocumentation);
  }

  return result;
}
