import { describe, expect, test } from "vitest";
import { filterWritableModels } from "./cme-model-utilities";
import { CmeModel, CmeModelType } from "./cme-model";

describe("filterWritableModels", () => {

  test("Filter.", () => {
    const actual = filterWritableModels([{
      dsModelType: CmeModelType.Default,
    } as CmeModel, {
      dsModelType: CmeModelType.InMemorySemanticModel,
    } as CmeModel, {
      dsModelType: CmeModelType.ExternalSemanticModel,
    } as CmeModel]);
    expect(actual).toEqual([{ dsModelType: CmeModelType.InMemorySemanticModel }]);
  });

  test("Filter an empty array.", () => {
    const actual = filterWritableModels([]);
    expect(actual).toStrictEqual([]);
  });

});
