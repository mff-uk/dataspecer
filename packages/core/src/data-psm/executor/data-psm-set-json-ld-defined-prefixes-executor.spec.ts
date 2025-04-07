import {
  CoreResource,
  CoreResourceReader,
  ReadOnlyMemoryStore,
} from "../../core";
import { DataPsmSetJsonLdDefinedPrefixes } from "../operation";
import { executeDataPsmSetJsonLdDefinedPrefixes } from "./data-psm-set-json-ld-defined-prefixes-executor";
import * as PSM from "../data-psm-vocabulary";

test("Update jsonLdDefinedPrefixes in data PSM schema.", async () => {
  const operation = new DataPsmSetJsonLdDefinedPrefixes();
  operation.dataPsmEntity = "http://schema";
  operation.jsonLdDefinedPrefixes = { ex: "http://example.com/" };

  const before = {
    "http://schema": {
      iri: "http://schema",
      types: [PSM.SCHEMA],
    },
  };

  const actual = await executeDataPsmSetJsonLdDefinedPrefixes(
    wrapResourcesWithReader(before),
    undefined,
    operation
  );

  expect(actual.failed).toBeFalsy();
  expect(actual.created).toEqual({});
  expect(actual.changed).toEqual({
    "http://schema": {
      iri: "http://schema",
      types: [PSM.SCHEMA],
      jsonLdDefinedPrefixes: operation.jsonLdDefinedPrefixes,
    },
  });
  expect(actual.deleted).toEqual([]);
});

function wrapResourcesWithReader(resources: {
  [iri: string]: CoreResource;
}): CoreResourceReader {
  return ReadOnlyMemoryStore.create(resources);
}
