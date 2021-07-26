import {createEmptyCoreResource} from "../../core";
import {asPimCreateSchema} from "../operation";
import {pimCreateSchemaExecutor} from "./pim-create-schema-executor";

test("Create schema.", async () => {
  const operation = asPimCreateSchema(createEmptyCoreResource());
  operation.pimBaseIri = "http://localhost/"
  operation.pimHumanLabel = {"en": "Label"};
  operation.pimHumanDescription = {"en": "Desc"};

  let counter = 0;
  const actual = await pimCreateSchemaExecutor(
    (name) => "http://localhost/" + ++counter, operation);

  const expected = {
    "http://localhost/1": {
      "iri": "http://localhost/1",
      "types": ["pim-schema"],
      "pimHumanLabel": operation.pimHumanLabel,
      "pimHumanDescription": operation.pimHumanDescription,
      "pimParts": [],
    }
  };

  expect(actual).toEqual(expected);

});

test("Create schema with given IRI.", () => {
  const operation = asPimCreateSchema(createEmptyCoreResource());
  operation.pimBaseIri = "http://localhost/"
  operation.pimHumanLabel = {"en": "Label"};
  operation.pimHumanDescription = {"en": "Desc"};
  operation.pimNewIri = "urn";

  const actual = pimCreateSchemaExecutor(undefined, operation);

  const expected = {
    [operation.pimNewIri]: {
      "iri": operation.pimNewIri,
      "types": ["pim-schema"],
      "pimHumanLabel": operation.pimHumanLabel,
      "pimHumanDescription": operation.pimHumanDescription,
      "pimParts": [],
    }
  };

  expect(actual).toEqual(expected);

});