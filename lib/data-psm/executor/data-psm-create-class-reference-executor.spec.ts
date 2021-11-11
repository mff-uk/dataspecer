import {CoreResourceReader, ReadOnlyMemoryStore} from "../../core";
import {DataPsmCreateClass, DataPsmCreateClassReference} from "../operation";
import {
  executeDataPsmCreateClass,
} from "./data-psm-create-class-executor";
import {executeDataPsmCreateClassReference} from "./data-psm-create-class-reference-executor";

test("Create data PSM class reference.", async () => {
  const operation = new DataPsmCreateClassReference();
  operation.dataPsmSpecification = "http://example.com/remote";

  const before = {
    "http://schema": {
      "iri": "http://schema",
      "types": ["data-psm-schema"],
      "dataPsmParts": ["http://base"],
    },
  };

  let counter = 0;
  const actual = await executeDataPsmCreateClassReference(
    wrapResourcesWithReader(before),
    () => "http://localhost/" + ++counter,
    operation);

  expect(actual.failed).toBeFalsy();
  expect(actual.created).toEqual({
    "http://localhost/1": {
      "iri": "http://localhost/1",
      "types": ["data-psm-class-reference"],
      "dataPsmSpecification": operation.dataPsmSpecification,
    },
  });
  expect(actual.changed).toEqual({
    "http://schema": {
      "iri": "http://schema",
      "types": ["data-psm-schema"],
      "dataPsmParts": [
        "http://base", "http://localhost/1",
      ],
    },
  });
  expect(actual.deleted).toEqual([]);
});

function wrapResourcesWithReader(
  resources: { [iri: string]: any },
): CoreResourceReader {
  return ReadOnlyMemoryStore.create(resources);
}
