import {CoreResourceReader, createCoreResource} from "../../core";
import {asDataPsmDeleteClass} from "../operation";
import {
  executesDataPsmDeleteClass,
} from "./data-psm-delete-class-executor";
import {ReadOnlyMemoryStore} from "../../core/store/memory-store";

test("Delete data PSM class.", async () => {
  const operation = asDataPsmDeleteClass(createCoreResource());
  operation.dataPsmClass = "http://class";

  const before = {
    "http://schema": {
      "iri": "http://schema",
      "types": ["data-psm-schema"],
      "dataPsmRoots": ["http://class"],
      "dataPsmParts": ["http://class"],
    },
    "http://class": {
      "iri": "http://class",
      "types": ["data-psm-class"],
      "dataPsmParts": [],
    },
  };

  const actual = await executesDataPsmDeleteClass(
    undefined,
    wrapResourcesWithReader(before),
    operation);

  expect(actual.failed).toBeFalsy();
  expect(actual.created).toEqual({});
  expect(actual.changed).toEqual({
    "http://schema": {
      "iri": "http://schema",
      "types": ["data-psm-schema"],
      "dataPsmRoots": [],
      "dataPsmParts": [],
    },
  });
  expect(actual.deleted).toEqual(["http://class"]);
});

function wrapResourcesWithReader(
  resources: { [iri: string]: any },
): CoreResourceReader {
  return new ReadOnlyMemoryStore(resources);
}
