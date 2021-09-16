import {CoreResourceReader, ReadOnlyMemoryStore} from "../../core";
import {PimDeleteAssociation} from "../operation";
import {executePimDeleteAssociation} from "./pim-delete-association-executor";

test("Delete association.", async () => {
  const operation = new PimDeleteAssociation();
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
    wrapResourcesWithReader(before),
    undefined, operation);

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
  return ReadOnlyMemoryStore.create(resources);
}
