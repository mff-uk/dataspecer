import {DocumentationModel, DocumentationModelStructure} from "../model";
import {
  conceptualModelToWebSpecification,
} from "./documentation-model-conceptual-adapter";
import {
  ConceptualModel,
  ConceptualModelClass,
  ConceptualModelProperty
} from "../../conceptual-model";
import {
  StructureModel,
  StructureModelClass,
  StructureModelProperty
} from "../../structure-model";
import {
  defaultStringSelector,
  LanguageString,
  StringSelector
} from "../../core";
import {structureModelToWebSpecificationPsm} from "./documentation-model-structure-adapter";

/**
 * Configuration object for the adapter.
 */
export type ModelsToWebSpecificationConfiguration = {

  /**
   * The object model can be in multiple languages, the specification
   * is is only one language.
   */
  selectString: StringSelector;

  createConceptualClassAnchor: (
    classData: ConceptualModelClass
  ) => string | null;

  createConceptualPropertyAnchor: (
    classData: ConceptualModelClass,
    propertyData: ConceptualModelProperty
  ) => string | null;

  createStructureAnchor: (
    structureModel: StructureModel
  ) => string | null;

  createStructureClassAnchor: (
    classData: StructureModelClass
  ) => string | null;

  createStructurePropertyAnchor: (
    classData: StructureModelClass,
    propertyData: StructureModelProperty
  ) => string | null;

  transformStructure: (
    structureModel: StructureModel,
    webModel: DocumentationModelStructure,
  ) => DocumentationModelStructure;

}

export function modelsToWebSpecification(
  conceptualModel: ConceptualModel,
  structureModels: StructureModel[],
  configuration: ModelsToWebSpecificationConfiguration,
): DocumentationModel {
  const result = new DocumentationModel();
  result.humanLabel =
    configuration.selectString(conceptualModel.humanLabel);
  result.humanDescription =
    configuration.selectString(conceptualModel.humanDescription);
  result.conceptual =
    conceptualModelToWebSpecification(configuration, conceptualModel);
  result.structures = structureModels.map( model => {
    const webSpecification = structureModelToWebSpecificationPsm(
      configuration, result.conceptual, model);
    return configuration.transformStructure(model, webSpecification);
  });
  return result;
}

/**
 * Creates default configuration.
 */
export function createModelsToWebSpecificationConfiguration()
  : ModelsToWebSpecificationConfiguration {
  const selectString = defaultStringSelector;
  return {
    "selectString": selectString,
    "createConceptualClassAnchor":
      (classData) =>
        createAnchor(selectString, [
          "konceptuální",
          "třída", classData.humanLabel
        ]),
    "createConceptualPropertyAnchor":
      (classData, propertyData) =>
        createAnchor(selectString, [
          "konceptuální",
          "třída", classData.humanLabel,
          "vlastnost", propertyData.humanLabel
        ]),
    "createStructureAnchor":
      (structureModel) =>
        createAnchor(selectString, [
          "strukturální",
          "model", structureModel.humanLabel
        ]),
    "createStructureClassAnchor":
      (classData) =>
        createAnchor(selectString, [
          "strukturální",
          "třída", classData.humanLabel
        ]),
    "createStructurePropertyAnchor":
      (classData, propertyData) =>
        createAnchor(selectString, [
          "strukturální",
          "třída", classData.humanLabel,
          "vlastnost", propertyData.humanLabel
        ]),
    "transformStructure": (structureModel, webModel) => webModel,
  }
}

function createAnchor(
  selectString: StringSelector,
  parts: (string | LanguageString)[],
): string {
  const stringParts = parts.map(part => {
    if (typeof part === "string") {
      return part;
    } else {
      const selected = selectString(part);
      if (selected === null) {
        return null;
      }
      return encodeIriComponent(selected);
    }
  }).filter(part => part !== null);
  return stringParts.join("-");
}

function encodeIriComponent(url: string): string {
  return url.toLowerCase().replace(new RegExp("\\s", "g"), "-");
}
