import { clone } from "./clone";

test("Clone object.", () => {
  const expected = {
    name: "Petr",
    age: 25,
    properties: {
      languages: ["c++", "java"],
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

test("Clone with references.", () => {
  const expected = {
    self: null,
    arr: []
  };
  expected.self = expected;
  expected.arr.push(expected);

  const actual = clone(expected);
  expect(actual).toStrictEqual(expected);
  // Check that changes to old object have no impact on the clone.
  expected.self = null;
  expected.arr = [null];
  expect(actual.self === actual).toBeTruthy();
  expect(actual.arr[0] === actual).toBeTruthy();
});

class A {
  value = 10;

  getValue() {
    return this.value;
  }
}

test("Clone instance", () => {
  const original = new A();
  original.value = 20;
  const actual = clone(original);

  expect(actual instanceof A).toBeTruthy();
  original.value = 30;
  expect(actual.getValue()).toBe(20);
});
