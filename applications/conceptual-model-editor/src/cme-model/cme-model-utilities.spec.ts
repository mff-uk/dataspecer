import { expect, describe, test } from "vitest";
import { filterWritableModels } from "./cme-model-utilities";
import { CmeModelType } from "./cme-model";

describe("filterWritableModels", () => {

  test("Filter.", () => {
    const actual = filterWritableModels([{
      dsModelType: CmeModelType.Default,
    } as any, {
      dsModelType: CmeModelType.InMemorySemanticModel,
    } as any, {
      dsModelType: CmeModelType.ExternalSemanticModel,
    } as any]);
    expect(actual).toEqual([{ dsModelType: CmeModelType.InMemorySemanticModel }]);
  });

  test("Filter an empty array.", () => {
    const actual = filterWritableModels([]);
    expect(actual).toStrictEqual([]);
  });

});
