import { describe, expect, test } from "vitest";

import { addToMapArray, removeFromArray, replaceByIndexInArray, replaceInArray } from "./functional";

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

  test("Default test.", () => {
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

  test("Default test.", () => {
    const actual = replaceByIndexInArray(1, "one", ["zero", "", "two"]);
    const expected = ["zero", "one", "two"];
    expect(actual).toStrictEqual(expected);
  });

});

describe("replaceInArray", () => {

  test("Default test.", () => {
    const actual = replaceInArray("a", "A", ["a", "b", "c"]);
    const expected = ["A", "b", "c"];
    expect(actual).toStrictEqual(expected);
  });

  test("Replace first only.", () => {
    const actual = replaceInArray("a", "A", ["a", "b", "a"]);
    const expected = ["A", "b", "a"];
    expect(actual).toStrictEqual(expected);
  });

  test("Replace missing does nothing.", () => {
    const actual = replaceInArray("X", "A", ["a", "b", "c"]);
    const expected = ["a", "b", "c"];
    expect(actual).toStrictEqual(expected);
  });

});
