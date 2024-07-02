import { lowerCamelCase, upperCamelCase, kebabCase } from "./naming-styles";

test("Test lowerCamelCase.", () => {
  expect(lowerCamelCase("First second Third")).toBe("firstSecondThird");
});

test("Test upperCamelCase.", () => {
  expect(upperCamelCase("First second Third")).toBe("FirstSecondThird");
});

test("Test kebabCase.", () => {
  expect(kebabCase("First second Third")).toBe("first-second-third");
});
