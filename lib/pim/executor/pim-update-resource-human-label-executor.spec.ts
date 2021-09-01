import {
  CoreResourceReader,
  createCoreResource,
} from "../../core";
import {asPimUpdateResourceHumanLabel} from "../operation";
import {
  executePimUpdateResourceHumanLabel,
} from "./pim-update-resource-human-label-executor";
import {ReadOnlyMemoryStore} from "../../core/store/memory-store";

test("Update resource human label.", async () => {
  const operation = asPimUpdateResourceHumanLabel(
    createCoreResource());
  operation.pimResource = "http://localhost/1";
  operation.pimHumanLabel = {"cs": "Popis"};

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
      "pimHumanLabel": {"en": "Label"},
    },
  };

  const actual = await executePimUpdateResourceHumanLabel(
    undefined, wrapResourcesWithReader(before), operation);

  expect(actual.failed).toBeFalsy();
  expect(actual.created).toEqual({});
  expect(actual.changed).toEqual({
    "http://localhost/1": {
      "iri": "http://localhost/1",
      "types": ["pim-attribute"],
      "pimOwnerClass": "http://class",
      "pimHumanLabel": {"cs": "Popis"},
    },
  });
  expect(actual.deleted).toEqual([]);
});

function wrapResourcesWithReader(
  resources: { [iri: string]: any },
): CoreResourceReader {
  return new ReadOnlyMemoryStore(resources);
}
