import {
  createCoreResource,
} from "../../core";
import {
  asPimCreateSchema,
  isPimCreateSchemaResult,
  PimCreateSchemaResult,
} from "../operation";
import {executePimCreateSchema} from "./pim-create-schema-executor";

test("Create schema.", async () => {
  const operation = asPimCreateSchema(createCoreResource());
  operation.pimBaseIri = "http://localhost/";
  operation.pimHumanLabel = {"en": "Label"};
  operation.pimHumanDescription = {"en": "Desc"};

  let counter = 0;
  const actual = await executePimCreateSchema(
    () => "http://localhost/" + ++counter,
    undefined,
    operation);

  expect(actual.failed).toBeFalsy();
  expect(actual.created).toEqual({
    "http://localhost/1": {
      "iri": "http://localhost/1",
      "types": ["pim-schema"],
      "pimHumanLabel": operation.pimHumanLabel,
      "pimHumanDescription": operation.pimHumanDescription,
      "pimParts": [],
    },
  });
  expect(actual.changed).toEqual({});
  expect(actual.deleted).toEqual([]);
  expect(isPimCreateSchemaResult(actual.operationResult)).toBeTruthy();
  const result = actual.operationResult as PimCreateSchemaResult;
  expect(result.createdPimSchema).toEqual("http://localhost/1");
});

test("Create schema with given IRI.", async () => {
  const operation = asPimCreateSchema(createCoreResource());
  operation.pimBaseIri = "http://localhost/";
  operation.pimHumanLabel = {"en": "Label"};
  operation.pimHumanDescription = {"en": "Desc"};
  operation.pimNewIri = "urn";

  const actual = await executePimCreateSchema(
    undefined, undefined, operation);

  expect(actual.failed).toBeFalsy();
  expect(actual.created).toEqual({
    [operation.pimNewIri]: {
      "iri": operation.pimNewIri,
      "types": ["pim-schema"],
      "pimHumanLabel": operation.pimHumanLabel,
      "pimHumanDescription": operation.pimHumanDescription,
      "pimParts": [],
    },
  });
  expect(actual.changed).toEqual({});
  expect(actual.deleted).toEqual([]);
  expect(isPimCreateSchemaResult(actual.operationResult)).toBeTruthy();
  const result = actual.operationResult as PimCreateSchemaResult;
  expect(result.createdPimSchema).toEqual(operation.pimNewIri);
});
