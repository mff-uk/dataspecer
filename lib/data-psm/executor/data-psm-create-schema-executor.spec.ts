import {CoreResourceReader, createCoreResource} from "../../core";
import {asDataPsmCreateSchema} from "../operation";
import {
  executesDataPsmCreateSchema,
} from "./data-psm-create-schema-executor";
import {ReadOnlyMemoryStore} from "../../core/store/memory-store";

test("Create data PSM schema.", async () => {
  const operation = asDataPsmCreateSchema(createCoreResource());
  operation.dataPsmHumanLabel = {"en": "Label"};
  operation.dataPsmHumanDescription = {"en": "Desc"};

  const before = {};

  let counter = 0;
  const actual = await executesDataPsmCreateSchema(
    () => "http://localhost/" + ++counter,
    wrapResourcesWithReader(before),
    operation);

  expect(actual.failed).toBeFalsy();
  expect(actual.created).toEqual({
    "http://localhost/1": {
      "iri": "http://localhost/1",
      "types": ["data-psm-schema"],
      "dataPsmHumanLabel": operation.dataPsmHumanLabel,
      "dataPsmHumanDescription": operation.dataPsmHumanDescription,
      "dataPsmRoots": [],
      "dataPsmParts": [],
    },
  });
  expect(actual.changed).toEqual({});
  expect(actual.deleted).toEqual([]);
});

function wrapResourcesWithReader(
  resources: { [iri: string]: any },
): CoreResourceReader {
  return new ReadOnlyMemoryStore(resources);
}
