import {
  DataSpecification,
} from "../data-specification/model";
import {assertFailed, assertNot, CoreResourceReader} from "../core";
import {StreamDictionary} from "../io/stream/stream-dictionary";
import {ArtefactGenerator} from "./artefact-generator";
import {
  ArtefactGeneratorContext,
  StructureClassLocation,
} from "./artefact-generator-context";
import {coreResourcesToConceptualModel} from "../conceptual-model";
import {
  coreResourcesToStructuralModel,
  StructureModel,
} from "../structure-model";

const generators: { [iri: string]: () => ArtefactGenerator } = {};

export function registerGeneratorFactory(factory: () => ArtefactGenerator) {
  const instance = factory();
  generators[instance.identifier()] = factory;
}

export class Generator {

  private readonly specifications: { [iri: string]: DataSpecification } = {};

  private readonly reader: CoreResourceReader;

  constructor(
    specifications: DataSpecification[],
    reader: CoreResourceReader,
  ) {
    for (const specification of specifications) {
      this.specifications[specification.iri] = specification;
    }
    this.reader = reader;
  }

  public async generate(
    specificationIri: string,
    output: StreamDictionary,
  ): Promise<void> {
    const specification = this.specifications[specificationIri];
    assertNot(
      specification == undefined,
      `Missing specification ${specificationIri}`);
    const context = await this.createContext();
    for (const artefact of specification.artefacts) {
      const generator = generators[artefact.generator]();
      assertNot(
        generator == undefined,
        `Missing generator ${artefact.generator}`);
      await generator.generateToStream(
        context, artefact, specification, output);
    }
  }

  private async createContext(): Promise<ArtefactGeneratorContext> {
    const conceptualModels = {};
    const structureModels = {};
    for (const specification of Object.values(this.specifications)) {
      conceptualModels[specification.pim] =
        await coreResourcesToConceptualModel(this.reader, specification.pim);
      for (const iri of specification.psms) {
        structureModels[iri] =
          await coreResourcesToStructuralModel(this.reader, iri);
      }
    }

    const createGenerator =
      (iri) => Promise.resolve(generators[iri]?.() ?? null);

    const findStructureClass =
      (iri) => this.findStructureClass(structureModels, iri);

    return {
      "reader": this.reader,
      "specifications": this.specifications,
      "conceptualModels": conceptualModels,
      "structureModels": structureModels,
      "createGenerator": createGenerator,
      "findStructureClass": findStructureClass,
    };
  }

  private findStructureClass(
    structureModels: { [iri: string]: StructureModel },
    iri: string
  ): StructureClassLocation | null {
    const structureModel = findStructureClassModel(structureModels, iri);
    if (structureModel === null) {
      return null;
    }
    for (const specification of Object.values(this.specifications)) {
      if (specification.psms.includes(structureModel.psmIri)) {
        return {
          "structureModel": structureModel,
          "specification": specification,
        };
      }
    }
    assertFailed(
      `Missing specification for structure model '${structureModel.psmIri}'.`);
  }

}

function findStructureClassModel(
  structureModels: { [iri: string]: StructureModel },
  iri: string
): StructureModel | null {
  for (const structureModel of Object.values(structureModels)) {
    if (structureModel.classes[iri] === undefined) {
      continue;
    }
    return structureModel;
  }
  return null;
}
