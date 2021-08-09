import {
  createCoreResource,
} from "../../core";
import {asPimCreateSchema} from "../operation";
import {executePimCreateSchema} from "./pim-create-schema-executor";

test("Create schema.", async () => {
  const operation = asPimCreateSchema(createCoreResource());
  operation.pimBaseIri = "http://localhost/";
  operation.pimHumanLabel = {"en": "Label"};
  operation.pimHumanDescription = {"en": "Desc"};

  let counter = 0;
  const actual = await executePimCreateSchema(
    (name) => "http://localhost/" + ++counter,
    undefined,
    operation);

  const expected = {
    "http://localhost/1": {
      "iri": "http://localhost/1",
      "types": ["pim-schema"],
      "pimHumanLabel": operation.pimHumanLabel,
      "pimHumanDescription": operation.pimHumanDescription,
      "pimParts": [],
    },
  };

  expect(actual.failed).toBeFalsy();
  expect(actual.changedResources).toEqual(expected);
});

test("Create schema with given IRI.", async () => {
  const operation = asPimCreateSchema(createCoreResource());
  operation.pimBaseIri = "http://localhost/";
  operation.pimHumanLabel = {"en": "Label"};
  operation.pimHumanDescription = {"en": "Desc"};
  operation.pimNewIri = "urn";

  const actual = await executePimCreateSchema(
    undefined, undefined, operation);

  const expected = {
    [operation.pimNewIri]: {
      "iri": operation.pimNewIri,
      "types": ["pim-schema"],
      "pimHumanLabel": operation.pimHumanLabel,
      "pimHumanDescription": operation.pimHumanDescription,
      "pimParts": [],
    },
  };

  expect(actual.failed).toBeFalsy();
  expect(actual.changedResources).toEqual(expected);
});
