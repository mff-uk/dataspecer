import { describe, expect, test } from "vitest";
import { filterWritableModels } from "./cme-model-utilities";
import { CmeSemanticModel, CmeSemanticModelType } from "./model/cme-semantic-model";

describe("filterWritableModels", () => {

  test("Filter.", () => {
    const actual = filterWritableModels([{
      dsModelType: CmeSemanticModelType.Default,
    } as CmeSemanticModel, {
      dsModelType: CmeSemanticModelType.InMemorySemanticModel,
    } as CmeSemanticModel, {
      dsModelType: CmeSemanticModelType.ExternalSemanticModel,
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
