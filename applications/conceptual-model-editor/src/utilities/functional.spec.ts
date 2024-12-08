import { expect, test } from "vitest";

import { removeFromArray } from "./functional";

test("Remove string from an array.", () => {
  const before = ["a", "b", "c"];
  const actual = removeFromArray(before, "b");
  const expected = ["a", "c"];
  expect(actual).toStrictEqual(expected);
});

test("Try to remove a non-existing string from an array.", () => {
  const before = ["a", "b", "c"];
  const actual = removeFromArray(before, "d");
  expect(actual).toBe(before);
});
