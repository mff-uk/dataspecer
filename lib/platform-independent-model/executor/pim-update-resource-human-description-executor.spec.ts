import {
  CoreResource,
  CoreModelReader,
  createEmptyCoreResource,
} from "../../core";
import {asPimUpdateResourceHumanDescription} from "../operation";
import {
  executePimUpdateResourceHumanDescription,
} from "./pim-update-resource-human-description-executor";

test("Update resource human description.", async () => {
  const operation = asPimUpdateResourceHumanDescription(
    createEmptyCoreResource());
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

  const expected = {
    "http://localhost/1": {
      "iri": "http://localhost/1",
      "types": ["pim-attribute"],
      "pimOwnerClass": "http://class",
      "pimHumanDescription": {"cs": "Popis"},
    },
  };

  expect(actual.failed).toBeFalsy();
  expect(actual.changedResources).toEqual(expected);
});

function wrapResourcesWithReader(
  resources: { [iri: string]: any },
): CoreModelReader {

  return new class implements CoreModelReader {

    listResources(): Promise<string[]> {
      return Promise.resolve(Object.keys(resources));
    }

    readResource(iri: string): Promise<CoreResource> {
      return Promise.resolve(resources[iri]);
    }

  };
}
