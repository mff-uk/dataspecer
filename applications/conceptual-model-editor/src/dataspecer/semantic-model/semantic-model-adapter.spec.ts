import { describe, expect, test } from "vitest";

import { VisualModel } from "@dataspecer/core-v2/visual-model";
import { EntityModel } from "@dataspecer/core-v2";

import { entityModelToCmeVocabulary, entityModelsMapToCmeSemanticModel, setDefaultModelColor, setTranslateFunction } from "./semantic-model-adapter";
import { CmeSemanticModelType } from "../cme-model";

// Disable translation.
setTranslateFunction(text => `t:${text}`);

// Set default color.
setDefaultModelColor("#111111");

describe("entityModelsMapToCmeSemanticModel", () => {

  test("Convert a model.", () => {
    const models : Map<string, EntityModel> = new Map();
    models.set("", {
      getId: () => "abcd",
      getAlias: () => "mock model",
    } as any);

    const actual = entityModelsMapToCmeSemanticModel(models, null);

    expect(actual).toStrictEqual([{
      dsIdentifier: "abcd",
      displayLabel: { "": "mock model" },
      displayColor: "#111111",
      dsModelType: CmeSemanticModelType.Default,
      baseIri: null,
    }]);
  });

}) ;

describe("entityModelToCmeModel", () => {

  test("Convert a default model.", () => {
    const actual = entityModelToCmeVocabulary({
      getId: () => "abcd",
      getAlias: () => "mock model",
      getBaseIri: () => "http://base",
    } as any, {
      getModelColor: (identifier: string) => {
        return identifier + "-blue";
      },
    } as VisualModel);

    expect(actual).toStrictEqual({
      dsIdentifier: "abcd",
      displayLabel: { "": "mock model" },
      displayColor: "abcd-blue",
      dsModelType: CmeSemanticModelType.Default,
      baseIri: "http://base",
    });
  });

  test("Convert a model without alias.", () => {
    const actual = entityModelToCmeVocabulary({
      getId: () => "abcd",
      getAlias: () => null,
    } as EntityModel, {
      getModelColor: (identifier: string) => {
        return identifier + "-blue";
      },
    } as VisualModel);

    expect(actual).toStrictEqual({
      dsIdentifier: "abcd",
      displayLabel: { "": "t:model-service.model-label-from-id" },
      displayColor: "abcd-blue",
      dsModelType: CmeSemanticModelType.Default,
      baseIri: null,
    });
  });

  test("Convert without a visual model.", () => {
    const actual = entityModelToCmeVocabulary({
      getId: () => "abcd",
      getAlias: () => "mock model",
    } as EntityModel, null);

    expect(actual).toStrictEqual({
      dsIdentifier: "abcd",
      displayLabel: { "": "mock model" },
      displayColor: "#111111",
      dsModelType: CmeSemanticModelType.Default,
      baseIri: null,
    });
  });

});
