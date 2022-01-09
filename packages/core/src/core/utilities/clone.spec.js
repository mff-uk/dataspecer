import {clone} from "./clone";

test("Clone object.", () => {
  const expected = {
    "name": "Petr",
    "age": 25,
    "properties": {
      "languages": [
        "c++", "java",
      ],
    },
  };
  const actual = clone(expected);
  expect(actual).toStrictEqual(expected);
  // Check that changes to old object have no impact on the clone.
  expected.properties["new"] = "value";
  expected.properties.languages.push("typescript");
  expect(actual.properties["new"]).toBeUndefined();
  expect(actual.properties.languages).toHaveLength(2);
});
