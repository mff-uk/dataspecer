import {
  CoreResource,
  CoreModelReader,
  createEmptyCoreResource
} from "../../core";
import {asPimDeleteAssociation} from "../operation";
import {
  executePimDeleteAssociation,
} from "./pim-delete-association-executor";

test("Delete association.", async () => {
  const operation = asPimDeleteAssociation(createEmptyCoreResource());
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
      "pimEnd": ["http://localhost/1", "http://localhost/2"]
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

  const expected = {
    "http://schema": {
      "iri": "http://schema",
      "types": ["pim-schema"],
      "pimParts": [
        "http://class", "http://left", "http://right",
      ],
    },
  };

  expect(actual.failed).toBeFalsy();
  expect(actual.changedResources).toEqual(expected);
  expect(actual.deletedResource.sort()).toEqual([
    "http://localhost/1",
    "http://localhost/2",
    "http://localhost/3",
  ].sort());
});

function wrapResourcesWithReader(
  resources: { [iri: string]: any }
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

