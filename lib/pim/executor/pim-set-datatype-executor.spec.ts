import {CoreResourceReader, ReadOnlyMemoryStore} from "../../core";
import {PimSetDatatype} from "../operation";
import {
  executePimSetDataType,
} from "./pim-set-datatype-executor";

test("Update attribute datatype.", async () => {
  const operation = new PimSetDatatype();
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

  const actual = await executePimSetDataType(
    wrapResourcesWithReader(before),
    undefined, operation);

  expect(actual.failed).toBeFalsy();
  expect(actual.created).toEqual({});
  expect(actual.changed).toEqual({
    "http://localhost/1": {
      "iri": "http://localhost/1",
      "types": ["pim-attribute"],
      "pimOwnerClass": "http://class",
      "pimDatatype": "xsd:integer",
    },
  });
  expect(actual.deleted).toEqual([]);
});

function wrapResourcesWithReader(
  resources: { [iri: string]: any },
): CoreResourceReader {
  return ReadOnlyMemoryStore.create(resources);
}
