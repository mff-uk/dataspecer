import {JsonLdEntity} from "./jsonld-types";
import {
  getId,
  getTypes,
  getResource,
  getResources,
  getStrings,
  getValue,
  getValues,
} from "./jsonld-entity";

test("Get IRI.", () => {
  const entity: JsonLdEntity = {
    "@id": "http://resource"
  };
  expect(getId(entity))
    .toBe("http://resource");
});

test("Get type.", () => {
  const entity: JsonLdEntity = {
    "@type": "http://localhost"
  };
  expect(getTypes(entity))
    .toEqual(["http://localhost"]);
});

test("Get type.", () => {
  const entity: JsonLdEntity = {
    "@type": [
      "http://localhost/1",
      "http://localhost/2"
    ]
  };
  expect(getTypes(entity))
    .toEqual(["http://localhost/1", "http://localhost/2"]);
});

test("Get single resource.", () => {
  const entity: JsonLdEntity = {
    "http://property": {
      "@id": "http://localhost/1"
    }
  };
  expect(getResource(entity, "http://property"))
    .toEqual("http://localhost/1");
  expect(getResources(entity, "http://property"))
    .toEqual(["http://localhost/1"]);
});


test("Get multiple resources.", () => {
  const entity: JsonLdEntity = {
    "http://property": [
      {
        "@id": "http://localhost/1"
      },
      {
        "@id": "http://localhost/2"
      }
    ]
  };
  expect(getResource(entity, "http://property"))
    .toEqual("http://localhost/1");
  expect(getResources(entity, "http://property"))
    .toEqual(["http://localhost/1", "http://localhost/2"]);
});

test("Get plain string.", () => {
  const entity: JsonLdEntity = {
    "http://property": "1"
  };
  expect(getStrings(entity, "http://property"))
    .toEqual([{"": "1"}]);
});

test("Get multiple plain strings.", () => {
  const entity: JsonLdEntity = {
    "http://property": ["1", "2"]
  };
  expect(getStrings(entity, "http://property"))
    .toEqual([{"": "1"}, {"": "2"}]);
});

test("Get complex string.", () => {
  const entity: JsonLdEntity = {
    "http://property": {
      "@value": "1",
      "@language": "cs",
    }
  };
  expect(getStrings(entity, "http://property"))
    .toEqual([{"cs": "1"}]);
});

test("Get empty string", () => {
  const entity: JsonLdEntity = {
    "http://property": [
      {"@value": ""}
    ]
  };
  expect(getStrings(entity, "http://property"))
    .toEqual([{"": ""}]);
});

test("Get multiple mixed strings.", () => {
  const entity: JsonLdEntity = {
    "http://property": [
      "1",
      {"@language": "cs", "@value": "2"}
    ]
  };
  expect(getStrings(entity, "http://property"))
    .toEqual([{"": "1"}, {"cs": "2"}]);
});


test("Get multiple mixed values.", () => {
  const entity: JsonLdEntity = {
    "http://property": [
      1,
      {"@value": "2"}
    ]
  };
  expect(getValues(entity, "http://property"))
    .toEqual([1, "2"]);
});

test("Get value.", () => {
  const entity: JsonLdEntity = {
    "urn:datasetsCount": [
      {"@value": 1}
    ]
  };
  expect(getValue(entity, "urn:datasetsCount"))
    .toEqual(1);
});

test("Get empty value", () => {
  const entity: JsonLdEntity = {
    "http://property": [
      {"@value": ""}
    ]
  };
  expect(getValues(entity, "http://property")).toEqual([""]);
});
