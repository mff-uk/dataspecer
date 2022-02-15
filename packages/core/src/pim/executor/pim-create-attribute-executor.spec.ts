import {
  CoreResource,
  CoreResourceReader,
  ReadOnlyMemoryStore,
} from "../../core";
import { PimCreateAttribute, PimCreateAttributeResult } from "../operation";
import { executePimCreateAttribute } from "./pim-create-attribute-executor";
import * as PIM from "../pim-vocabulary";

test("Create attribute.", async () => {
  const operation = new PimCreateAttribute();
  operation.pimInterpretation = "attribute";
  operation.pimTechnicalLabel = "name";
  operation.pimHumanLabel = { en: "Label" };
  operation.pimHumanDescription = { en: "Desc" };
  operation.pimOwnerClass = "http://class";
  operation.pimDatatype = "xsd:string";

  const before = {
    "http://schema": {
      iri: "http://schema",
      types: [PIM.SCHEMA],
      pimParts: ["http://class"],
    },
    "http://class": {
      iri: "http://class",
      types: [PIM.CLASS],
    },
  };

  let counter = 0;
  const actual = await executePimCreateAttribute(
    wrapResourcesWithReader(before),
    () => "http://localhost/" + ++counter,
    operation
  );

  expect(actual.failed).toBeFalsy();
  expect(actual.created).toEqual({
    "http://localhost/1": {
      iri: "http://localhost/1",
      types: [PIM.ATTRIBUTE],
      pimInterpretation: operation.pimInterpretation,
      pimTechnicalLabel: operation.pimTechnicalLabel,
      pimHumanLabel: operation.pimHumanLabel,
      pimHumanDescription: operation.pimHumanDescription,
      pimOwnerClass: operation.pimOwnerClass,
      pimDatatype: operation.pimDatatype,
      pimCardinalityMax: null,
      pimCardinalityMin: null,
    },
  });
  expect(actual.changed).toEqual({
    "http://schema": {
      iri: "http://schema",
      types: [PIM.SCHEMA],
      pimParts: ["http://class", "http://localhost/1"],
    },
  });
  expect(actual.deleted).toEqual([]);
  expect(PimCreateAttributeResult.is(actual.operationResult)).toBeTruthy();
  const result = actual.operationResult as PimCreateAttributeResult;
  expect(result.createdPimAttribute).toBe("http://localhost/1");
});

function wrapResourcesWithReader(resources: {
  [iri: string]: CoreResource;
}): CoreResourceReader {
  return ReadOnlyMemoryStore.create(resources);
}
