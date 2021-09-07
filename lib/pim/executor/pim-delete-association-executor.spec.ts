import {
  CoreResourceReader,
  createCoreResource,
} from "../../core";
import {asPimDeleteAssociation} from "../operation";
import {
  executePimDeleteAssociation,
} from "./pim-delete-association-executor";
import {ReadOnlyMemoryStore} from "../../core/store/memory-store";

test("Delete association.", async () => {
  const operation = asPimDeleteAssociation(createCoreResource());
  operation.pimAssociation = "http://localhost/3";

  const before = {
    "http://schema": {
      "iri": "http://schema",
      "types": ["pim-schema"],
      "pimParts": [
        "http://class", "http://left", "http://right",
        "http://localhost/3", "http://localhost/1", "http://localhost/2",
      ],
    },
    "http://localhost/3": {
      "iri": "http://localhost/3",
      "types": ["pim-association"],
      "pimEnd": ["http://localhost/1", "http://localhost/2"],
    },
    "http://localhost/2": {
      "iri": "http://localhost/2",
      "types": ["pim-association-end"],
      "pimPart": "http://right",
    },
    "http://localhost/1": {
      "iri": "http://localhost/1",
      "types": ["pim-association-end"],
      "pimPart": "http://left",
    },
  };

  const actual = await executePimDeleteAssociation(
    undefined,
    wrapResourcesWithReader(before),
    operation);

  expect(actual.failed).toBeFalsy();
  expect(actual.created).toEqual({});
  expect(actual.changed).toEqual({
    "http://schema": {
      "iri": "http://schema",
      "types": ["pim-schema"],
      "pimParts": [
        "http://class", "http://left", "http://right",
      ],
    },
  });
  expect(actual.deleted.sort()).toEqual([
    "http://localhost/1",
    "http://localhost/2",
    "http://localhost/3",
  ].sort());
});

function wrapResourcesWithReader(
  resources: { [iri: string]: any },
): CoreResourceReader {
  return new ReadOnlyMemoryStore(resources);
}
