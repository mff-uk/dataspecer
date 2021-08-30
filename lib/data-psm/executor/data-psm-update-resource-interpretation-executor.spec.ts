import {CoreResourceReader, createCoreResource} from "../../core";
import {
  asDataPsmUpdateResourceInterpretation,
} from "../operation";
import {
  executeDataPsmUpdateResourceInterpretation,
} from "./data-psm-update-resource-interpretation-executor";
import {ReadOnlyMemoryStore} from "../../core/store/memory-store";

test("Update data PSM resource interpretation.", async () => {
  const operation =
    asDataPsmUpdateResourceInterpretation(createCoreResource());
  operation.dataPsmResource = "http://class";
  operation.dataPsmInterpretation = "http://interpretation";

  const before = {
    "http://class": {
      "iri": "http://class",
      "types": ["data-psm-class"],
    },
  };

  const actual = await executeDataPsmUpdateResourceInterpretation(
    undefined,
    wrapResourcesWithReader(before),
    operation);

  expect(actual.failed).toBeFalsy();
  expect(actual.created).toEqual({});
  expect(actual.changed).toEqual({
    "http://class": {
      "iri": "http://class",
      "types": ["data-psm-class"],
      "dataPsmInterpretation": operation.dataPsmInterpretation,
    },
  });
  expect(actual.deleted).toEqual([]);
});

function wrapResourcesWithReader(
  resources: { [iri: string]: any },
): CoreResourceReader {
  return new ReadOnlyMemoryStore(resources);
}
