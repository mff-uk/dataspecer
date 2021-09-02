import {
  CoreResourceReader,
  createCoreResource,
} from "../../core";
import {asPimUpdateResourceTechnicalLabel} from "../operation";
import {
  executePimUpdateResourceTechnicalLabel,
} from "./pim-update-resource-technical-label-executor";
import {ReadOnlyMemoryStore} from "../../core/store/memory-store";

test("Update resource technical label.", async () => {
  const operation = asPimUpdateResourceTechnicalLabel(
    createCoreResource());
  operation.pimResource = "http://localhost/1";
  operation.pimTechnicalLabel = "NewLabel";

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
      "pimTechnicalLabel": "OldLabel",
    },
  };

  const actual = await executePimUpdateResourceTechnicalLabel(
    undefined, wrapResourcesWithReader(before), operation);

  expect(actual.failed).toBeFalsy();
  expect(actual.created).toEqual({});
  expect(actual.changed).toEqual({
    "http://localhost/1": {
      "iri": "http://localhost/1",
      "types": ["pim-attribute"],
      "pimOwnerClass": "http://class",
      "pimTechnicalLabel": "NewLabel",
    },
  });
  expect(actual.deleted).toEqual([]);
});

function wrapResourcesWithReader(
  resources: { [iri: string]: any },
): CoreResourceReader {
  return new ReadOnlyMemoryStore(resources);
}
