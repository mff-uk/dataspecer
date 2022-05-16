import {
  CoreResource,
  CoreResourceReader,
  ReadOnlyMemoryStore,
} from "../../../core";
import { DataPsmSetNamespaceXmlExtension } from "../operation";
import { executeDataPsmSetNamespaceXmlExtension } from "./data-psm-set-namespace-executor-xml-extension";
import * as PSM from "../../data-psm-vocabulary";
import {DataPsmSchemaXmlExtension} from "../model";
import {XML_EXTENSION} from "../vocabulary";

test("Update data PSM namespace and namespace prefix.", async () => {
  const operation = new DataPsmSetNamespaceXmlExtension();
  operation.dataPsmSchema = "http://schema";
  operation.namespace = "http://namespace";
  operation.namespacePrefix = "nsp";

  const before = {
    "http://schema": {
      iri: "http://schema",
      types: [PSM.SCHEMA],
    },
  };

  const actual = await executeDataPsmSetNamespaceXmlExtension(
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
      extensions: {
        [XML_EXTENSION]: {
          namespace: "http://namespace",
          namespacePrefix: "nsp",
        }
      }
    } as DataPsmSchemaXmlExtension,
  });
  expect(actual.deleted).toEqual([]);
});

function wrapResourcesWithReader(resources: {
  [iri: string]: CoreResource;
}): CoreResourceReader {
  return ReadOnlyMemoryStore.create(resources);
}
