import {createEmptyCoreResource} from "../../core";
import {asDataPsmCreateSchema} from "../operation";
import {
  executesDataPsmCreateSchema,
} from "./data-psm-create-schema-executor";
import {wrapResourcesWithReader} from "./data-psm-executor-utils-spec";

test("Create data PSM schema.", async () => {
  const operation = asDataPsmCreateSchema(createEmptyCoreResource());
  operation.dataPsmHumanLabel = {"en": "Label"};
  operation.dataPsmHumanDescription = {"en": "Desc"};

  const before = {  };

  let counter = 0;
  const actual = await executesDataPsmCreateSchema(
    (name) => "http://localhost/" + ++counter,
    wrapResourcesWithReader(before),
    operation);

  const expected = {
    "http://localhost/1": {
      "iri": "http://localhost/1",
      "types": ["data-psm-schema"],
      "dataPsmHumanLabel": operation.dataPsmHumanLabel,
      "dataPsmHumanDescription": operation.dataPsmHumanDescription,
      "dataPsmRoots": [],
      "dataPsmParts": [],
    },
  };

  expect(actual.failed).toBeFalsy();
  expect(actual.changedResources).toEqual(expected);
});
