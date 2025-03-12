import { expect, test } from "vitest";

import { kebabCase, lowerCamelCase, upperCamelCase } from "./naming-style-policy";

test("Test lowerCamelCase.", () => {
  expect(lowerCamelCase("First second Third")).toBe("firstSecondThird");
});

test("Test upperCamelCase.", () => {
  expect(upperCamelCase("First second Third")).toBe("FirstSecondThird");
});

test("Test kebabCase.", () => {
  expect(kebabCase("First second Third")).toBe("first-second-third");
});
