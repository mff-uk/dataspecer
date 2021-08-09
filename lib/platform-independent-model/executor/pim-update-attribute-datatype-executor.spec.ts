import {
  CoreResource,
  CoreModelReader,
  createEmptyCoreResource,
} from "../../core";
import {asPimUpdateAttributeDatatype} from "../operation";
import {
  executePimUpdateAttributeDataType,
} from "./pim-update-attribute-datatype-executor";

test("Update attribute datatype.", async () => {
  const operation = asPimUpdateAttributeDatatype(createEmptyCoreResource());
  operation.pimAttribute = "http://localhost/1";
  operation.pimDatatype = "xsd:integer";

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
      "pimDatatype": "xsd:string",
    },
  };

  const actual = await executePimUpdateAttributeDataType(
    undefined, wrapResourcesWithReader(before), operation);

  const expected = {
    "http://localhost/1": {
      "iri": "http://localhost/1",
      "types": ["pim-attribute"],
      "pimOwnerClass": "http://class",
      "pimDatatype": "xsd:integer",
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
