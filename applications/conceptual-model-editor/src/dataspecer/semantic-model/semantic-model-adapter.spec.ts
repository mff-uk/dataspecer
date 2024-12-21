import { expect, describe, test } from "vitest";

import { VisualModel } from "@dataspecer/core-v2/visual-model";
import { EntityModel } from "@dataspecer/core-v2";

import { setTranslateFunction, entityModelToCmeVocabulary, entityModelsMapToCmeVocabulary, setDefaultModelColor } from "./semantic-model-adapter";
import { CmeModelType } from "../cme-model";

// Disable translation.
setTranslateFunction(text => `t:${text}`);

// Set default color.
setDefaultModelColor("#111111");

describe("entityModelsMapToCmeVocabulary", () => {

  test("Convert a model.", () => {
    const models : Map<string, EntityModel> = new Map();
    models.set("", {
      getId: () => "abcd",
      getAlias: () => "mock model",
    } as any);

    const actual = entityModelsMapToCmeVocabulary(models, null);

    expect(actual).toStrictEqual([{
      dsIdentifier: "abcd",
      displayLabel: { "": "mock model" },
      displayColor: "#111111",
      dsModelType: CmeModelType.Default,
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
      dsModelType: CmeModelType.Default,
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
      dsModelType: CmeModelType.Default,
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
      dsModelType: CmeModelType.Default,
      baseIri: null,
    });
  });

});
