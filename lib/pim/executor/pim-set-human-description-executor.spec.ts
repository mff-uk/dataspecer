import {CoreResourceReader, ReadOnlyMemoryStore} from "../../core";
import {PimSetHumanDescription} from "../operation";
import {
  executePimSetHumanDescription,
} from "./pim-set-human-description-executor";

test("Update resource human description.", async () => {
  const operation = new PimSetHumanDescription(
  );
  operation.pimResource = "http://localhost/1";
  operation.pimHumanDescription = {"cs": "Popis"};

  const before = {
    "http://schema": {
      "iri": "http://schema",
      "types": ["pim-schema"],
      "pimParts": ["http://class", "http://localhost/1"],
    },
    "http://class": {
      "iri": "http://class",
      "types": ["pim-class"],
    },
    "http://localhost/1": {
      "iri": "http://localhost/1",
      "types": ["pim-attribute"],
      "pimOwnerClass": "http://class",
      "pimHumanDescription": {"en": "Description"},
    },
  };

  const actual = await executePimSetHumanDescription(
    wrapResourcesWithReader(before),
    undefined, operation);

  expect(actual.failed).toBeFalsy();
  expect(actual.created).toEqual({});
  expect(actual.changed).toEqual({
    "http://localhost/1": {
      "iri": "http://localhost/1",
      "types": ["pim-attribute"],
      "pimOwnerClass": "http://class",
      "pimHumanDescription": {"cs": "Popis"},
    },
  });
  expect(actual.deleted).toEqual([]);
});

function wrapResourcesWithReader(
  resources: { [iri: string]: any },
): CoreResourceReader {
  return ReadOnlyMemoryStore.create(resources);
}
