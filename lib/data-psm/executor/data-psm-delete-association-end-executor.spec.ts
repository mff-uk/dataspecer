import {CoreResourceReader, createCoreResource} from "../../core";
import {asDataPsmDeleteAssociationEnd} from "../operation";
import {
  executesDataPsmDeleteAssociationEnd,
} from "./data-psm-delete-association-end-executor";
import {ReadOnlyMemoryStore} from "../../core/store/memory-store";

test("Delete data PSM association-end.", async () => {
  const operation = asDataPsmDeleteAssociationEnd(createCoreResource());
  operation.dataPsmOwner = "http://class";
  operation.dataPsmAssociationEnd = "http://association-end";

  const before = {
    "http://schema": {
      "iri": "http://schema",
      "types": ["data-psm-schema"],
      "dataPsmParts": ["http://class", "http://association-end"],
    },
    "http://class": {
      "iri": "http://class",
      "types": ["data-psm-class"],
      "dataPsmParts": ["http://association-end"],
    },
    "http://association-end": {
      "iri": "http://association-end",
      "types": ["data-psm-association-end"],
    },
  };

  const actual = await executesDataPsmDeleteAssociationEnd(
    undefined,
    wrapResourcesWithReader(before),
    operation);

  expect(actual.failed).toBeFalsy();
  expect(actual.created).toEqual({});
  expect(actual.changed).toEqual({
    "http://schema": {
      "iri": "http://schema",
      "types": ["data-psm-schema"],
      "dataPsmParts": ["http://class"],
    },
    "http://class": {
      "iri": "http://class",
      "types": ["data-psm-class"],
      "dataPsmParts": [],
    },
  });
  expect(actual.deleted).toEqual(["http://association-end"]);
});

function wrapResourcesWithReader(
  resources: { [iri: string]: any },
): CoreResourceReader {
  return new ReadOnlyMemoryStore(resources);
}
