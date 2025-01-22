import { describe, expect, test } from "vitest";

import { addToMapArray, removeFromArray, replaceByIndexInArray } from "./functional";

describe("removeFromArray", () => {

  test("Remove string from an array.", () => {
    const before = ["a", "b", "c"];
    const actual = removeFromArray("b", before);
    const expected = ["a", "c"];
    expect(actual).toStrictEqual(expected);
  });

  test("Try to remove a non-existing string from an array.", () => {
    const before = ["a", "b", "c"];
    const actual = removeFromArray("d", before);
    expect(actual).toBe(before);
  });

});

describe("addToMapArray", () => {

  test("Build map array.", () => {
    const actual: Record<string, string[]> = {};
    addToMapArray("one", "one", actual);
    addToMapArray("one", "one copy", actual);
    addToMapArray("two", "two", actual);
    const expected: Record<string, string[]> = {
      "one": ["one", "one copy"],
      "two": ["two"],
    };
    expect(actual).toStrictEqual(expected);
  });

});

describe("replaceByIndexInArray", () => {

  test("Replace item.", () => {
    const actual = replaceByIndexInArray(1, "one", ["zero", "", "two"]);
    const expected = ["zero", "one", "two"];
    expect(actual).toStrictEqual(expected);
  });

});
