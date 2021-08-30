import {CoreResourceReader, createCoreResource} from "../../core";
import {
  asDataPsmUpdateResourceTechnicalLabel,
} from "../operation";
import {
  executeDataPsmUpdateResourceTechnicalLabel,
} from "./data-psm-update-resource-technical-label-executor";
import {ReadOnlyMemoryStore} from "../../core/store/memory-store";

test("Update data PSM resource technical label.", async () => {
  const operation =
    asDataPsmUpdateResourceTechnicalLabel(createCoreResource());
  operation.dataPsmResource = "http://class";
  operation.dataPsmTechnicalLabel = "technical";

  const before = {
    "http://class": {
      "iri": "http://class",
      "types": ["data-psm-class"],
    },
  };

  const actual = await executeDataPsmUpdateResourceTechnicalLabel(
    undefined,
    wrapResourcesWithReader(before),
    operation);

  expect(actual.failed).toBeFalsy();
  expect(actual.created).toEqual({});
  expect(actual.changed).toEqual({
    "http://class": {
      "iri": "http://class",
      "types": ["data-psm-class"],
      "dataPsmTechnicalLabel": operation.dataPsmTechnicalLabel,
    },
  });
  expect(actual.deleted).toEqual([]);
});

function wrapResourcesWithReader(
  resources: { [iri: string]: any },
): CoreResourceReader {
  return new ReadOnlyMemoryStore(resources);
}
