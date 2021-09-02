import {
  CoreResourceReader,
  createCoreResource,
} from "../../core";
import {asPimUpdateResourceHumanDescription} from "../operation";
import {
  executePimUpdateResourceHumanDescription,
} from "./pim-update-resource-human-description-executor";
import {ReadOnlyMemoryStore} from "../../core/store/memory-store";

test("Update resource human description.", async () => {
  const operation = asPimUpdateResourceHumanDescription(
    createCoreResource());
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

  const actual = await executePimUpdateResourceHumanDescription(
    undefined, wrapResourcesWithReader(before), operation);

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
  return new ReadOnlyMemoryStore(resources);
}
