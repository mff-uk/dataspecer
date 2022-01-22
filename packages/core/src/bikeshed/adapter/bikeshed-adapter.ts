import {
  Bikeshed,
  BikeshedContent,
  BikeshedContentSection,
  BikeshedContentText,
  BikeshedMetadataKeys
} from "../bikeshed-model";
import {
  BikeshedAdapterArtefactContext,
  BikeshedAdapterContext
} from "./bikeshed-adapter-context";
import {ConceptualModel} from "../../conceptual-model";
import {conceptualModelToBikeshedContent} from "./bikeshed-adapter-conceptual";
import {
  DataSpecification, DataSpecificationArtefact,
  DataSpecificationDocumentation,
  DataSpecificationSchema,
} from "../../data-specification/model";
import {assertNot} from "../../core";
import {StructureModel} from "../../structure-model";
import {BIKESHED} from "../bikeshed-vocabulary";

export async function specificationToBikeshed(
  context: BikeshedAdapterContext,
  artefact: DataSpecificationDocumentation,
  specification: DataSpecification,
): Promise<Bikeshed> {
  const generatorContext = context.generatorContext;
  const conceptualModel = generatorContext.conceptualModels[specification.pim];
  assertNot(
    conceptualModel === undefined,
    `Missing conceptual model ${specification.pim}.`);

  const result = new Bikeshed();
  result.metadata = createBikeshedMetadata(context, conceptualModel);

  result.content.push(await conceptualModelToBikeshedContent(
    context, conceptualModel));

  for (const iri of specification.psms) {
    const structureModel = context.generatorContext.structureModels[iri];
    assertNot(structureModel === null, `Missing model '${iri}'.`);
    const structureDocumentation = await createBikeshedStructureSection(
      context, artefact, specification, conceptualModel, structureModel);
    result.content.push(structureDocumentation);
  }

  return result;
}

function createBikeshedMetadata(
  context: BikeshedAdapterContext,
  conceptualModel: ConceptualModel,
): Record<string, string> {
  const label: string = context.selectString(conceptualModel.humanLabel)
    ?? "Missing label";
  return {
    [BikeshedMetadataKeys.title]: label,
    [BikeshedMetadataKeys.shortname]: label,
    [BikeshedMetadataKeys.status]: "LS",
    [BikeshedMetadataKeys.editor]: "Model-Driven Generator",
    [BikeshedMetadataKeys.boilerplate]: "conformance no, copyright no",
    [BikeshedMetadataKeys.abstract]:
    `Tento dokument je otevřenou formální normou ve smyslu <a href="https://www.zakonyprolidi.cz/cs/1999-106#p3-9">§ 3 odst. 9 zákona č. 106/1999 Sb., o svobodném přístupu k informacím</a>, pro zveřejňování číselníků.`
    + `Norma popisuje konceptuální model číselníků a stanovuje podobu jejich reprezentace ve strojově čítelné podobě ve formátech JSON-LD [[json-ld11]], a tedy i JSON [[ECMA-404]], a CSV [[rfc4180]] v denormalizované i normalizované podobě.`
    + `Jednotlivé způsoby reprezentace číselníků také demonstruje na příkladech.`,
    [BikeshedMetadataKeys.markup]: "markdown yes",
  };
}

/**
 * For each structure we generate a section. And into the section we include
 * all relevant artefacts. The artefacts are included in given order, if
 * they represent a given structure model (PSM).
 */
async function createBikeshedStructureSection(
  context: BikeshedAdapterContext,
  artefact: DataSpecificationDocumentation,
  specification: DataSpecification,
  conceptualModel: ConceptualModel,
  structureModel: StructureModel,
): Promise<BikeshedContent> {
  const label = context.selectString(structureModel.humanLabel);
  const result = new BikeshedContentSection(label, null);
  const description = context.selectString(structureModel.humanDescription);
  if (description !== null) {
    result.content.push(new BikeshedContentText(description));
  }

  for (const artefactToInclude of specification.artefacts) {

    if (!artefact.artefacts.includes(artefactToInclude.iri)) {
      continue;
    }

    if (!shouldBeIncluded(structureModel, artefactToInclude)) {
      continue;
    }

    const generator = await context.generatorContext.createGenerator(
      artefactToInclude.generator);
    if (generator === null) {
      continue;
    }

    const contextForGenerator : BikeshedAdapterArtefactContext = {
      ...context,
      "specification": specification,
      "artefact": artefactToInclude,
      "conceptualModel": conceptualModel,
      "structureModel": structureModel
    };

    const contentToInclude = await generator.generateForDocumentation(
      context.generatorContext,
      artefact,
      specification,
      BIKESHED.Generator,
      contextForGenerator,
    );

    if (contentToInclude === null) {
      continue;
    }

    result.content.push(contentToInclude as BikeshedContent);
  }

  return result;
}

function shouldBeIncluded(
  structureModel: StructureModel,
  artefact: DataSpecificationArtefact
): boolean {
  if (DataSpecificationSchema.is(artefact)) {
    if (artefact.psm === structureModel.psmIri) {
      return true;
    }
  }
  return false;
}

