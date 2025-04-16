import { describe, expect, test } from "vitest";

import { VisualModel } from "@dataspecer/core-v2/visual-model";
import { EntityModel } from "@dataspecer/core-v2";

import { CmeSemanticModelType } from "../model";
import { semanticModelToCmeSemanticModel } from "./cme-semantic-model-adapter";

describe("semanticModelMapToCmeSemanticModel", () => {

  test("Convert a default model.", () => {
    const actual = semanticModelToCmeSemanticModel({
      getId: () => "abcd",
      getAlias: () => "mock model",
      getBaseIri: () => "http://base",
    } as any, {
      getModelColor: (identifier: string) => {
        return identifier + "-blue";
      },
    } as VisualModel,
    "#111111",
    (identifier) => identifier,
    );

    expect(actual).toStrictEqual({
      identifier: "abcd",
      displayLabel: { "": "mock model" },
      displayColor: "abcd-blue",
      dsModelType: CmeSemanticModelType.DefaultSemanticModel,
      baseIri: "http://base",
    });
  });

  test("Convert a model without alias.", () => {
    const actual = semanticModelToCmeSemanticModel({
      getId: () => "abcd",
      getAlias: () => null,
    } as EntityModel, {
      getModelColor: (identifier: string) => {
        return identifier + "-blue";
      },
    } as VisualModel,
    "#111111",
    (identifier) => identifier,
    );

    expect(actual).toStrictEqual({
      identifier: "abcd",
      displayLabel: { "": "abcd" },
      displayColor: "abcd-blue",
      dsModelType: CmeSemanticModelType.DefaultSemanticModel,
      baseIri: null,
    });
  });

  test("Convert without a visual model.", () => {
    const actual = semanticModelToCmeSemanticModel({
      getId: () => "abcd",
      getAlias: () => "mock model",
    } as EntityModel, null,
    "#111111",
    (identifier) => identifier,
    );

    expect(actual).toStrictEqual({
      identifier: "abcd",
      displayLabel: { "": "mock model" },
      displayColor: "#111111",
      dsModelType: CmeSemanticModelType.DefaultSemanticModel,
      baseIri: null,
    });
  });

});
