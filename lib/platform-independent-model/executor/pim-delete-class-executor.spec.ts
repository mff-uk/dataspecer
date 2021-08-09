import {
  CoreResource,
  CoreModelReader,
  createEmptyCoreResource,
} from "../../core";
import {asPimDeleteClass} from "../operation";
import {
  executePimDeleteClass,
} from "./pim-delete-class-executor";

test("Delete class.", async () => {
  const operation = asPimDeleteClass(createEmptyCoreResource());
  operation.pimClass = "http://localhost/1";

  const before = {
    "http://schema": {
      "iri": "http://schema",
      "types": ["pim-schema"],
      "pimParts": [
        "http://localhost/1",
      ],
    },
    "http://localhost/1": {
      "iri": "http://localhost/1",
      "types": ["pim-class"],
    },
  };

  const actual = await executePimDeleteClass(
    undefined,
    wrapResourcesWithReader(before),
    operation);

  const expected = {
    "http://schema": {
      "iri": "http://schema",
      "types": ["pim-schema"],
      "pimParts": [],
    },
  };

  expect(actual.failed).toBeFalsy();
  expect(actual.changedResources).toEqual(expected);
  expect(actual.deletedResource.sort()).toEqual([
    "http://localhost/1",
  ].sort());
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
