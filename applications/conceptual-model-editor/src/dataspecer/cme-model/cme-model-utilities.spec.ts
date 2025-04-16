import { describe, expect, test } from "vitest";
import { filterWritableModels } from "./cme-model-utilities";
import { CmeSemanticModel, CmeSemanticModelType } from "./model/cme-semantic-model";

describe("filterWritableModels", () => {

  test("Filter.", () => {
    const actual = filterWritableModels([{
      modelType: CmeSemanticModelType.DefaultSemanticModel,
    } as CmeSemanticModel, {
      modelType: CmeSemanticModelType.InMemorySemanticModel,
    } as CmeSemanticModel, {
      modelType: CmeSemanticModelType.ExternalSemanticModel,
    } as CmeSemanticModel]);
    expect(actual).toEqual([{
      dsModelType: CmeSemanticModelType.InMemorySemanticModel,
    }]);
  });

  test("Filter an empty array.", () => {
    const actual = filterWritableModels([]);
    expect(actual).toStrictEqual([]);
  });

});
