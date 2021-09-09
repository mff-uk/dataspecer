import {CoreResourceReader, createCoreResource} from "../../core";
import {asDataPsmUpdateAttributeDatatype} from "../operation";
import {
  executeDataPsmUpdateAttributeDatatype,
} from "./data-psm-update-attribute-datatype-executor";
import {ReadOnlyMemoryStore} from "../../core";

test("Update data PSM attribute datatype.", async () => {
  const operation =
    asDataPsmUpdateAttributeDatatype(createCoreResource());
  operation.dataPsmAttribute = "http://attribute";
  operation.dataPsmDatatype = "http://type";

  const before = {
    "http://attribute": {
      "iri": "http://attribute",
      "types": ["data-psm-attribute"],
    },
  };

  const actual = await executeDataPsmUpdateAttributeDatatype(
    undefined,
    wrapResourcesWithReader(before),
    operation);

  expect(actual.failed).toBeFalsy();
  expect(actual.created).toEqual({});
  expect(actual.changed).toEqual({
    "http://attribute": {
      "iri": "http://attribute",
      "types": ["data-psm-attribute"],
      "dataPsmDatatype": operation.dataPsmDatatype,
    },
  });
  expect(actual.deleted).toEqual([]);
});

function wrapResourcesWithReader(
  resources: { [iri: string]: any },
): CoreResourceReader {
  return new ReadOnlyMemoryStore(resources);
}
