import {
  CoreResource,
  CoreModelReader,
  createCoreResource,
} from "../../core";
import {asPimUpdateResourceTechnicalLabel} from "../operation";
import {
  executePimUpdateResourceTechnicalLabel,
} from "./pim-update-resource-technical-label-executor";

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

  const expected = {
    "http://localhost/1": {
      "iri": "http://localhost/1",
      "types": ["pim-attribute"],
      "pimOwnerClass": "http://class",
      "pimTechnicalLabel": "NewLabel",
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
