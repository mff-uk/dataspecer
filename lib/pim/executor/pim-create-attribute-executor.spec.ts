import {
  CoreResource,
  CoreResourceReader,
  createCoreResource,
} from "../../core";
import {
  asPimCreateAttribute,
  isPimCreateAssociationResult,
  isPimCreateAttributeResult,
  PimCreateAssociationResult,
  PimCreateAttributeResult
} from "../operation";
import {executePimCreateAttribute} from "./pim-create-attribute-executor";
import {ReadOnlyMemoryStore} from "../../core/store/memory-store";

test("Create attribute.", async () => {
  const operation = asPimCreateAttribute(createCoreResource());
  operation.pimInterpretation = "attribute";
  operation.pimTechnicalLabel = "name";
  operation.pimHumanLabel = {"en": "Label"};
  operation.pimHumanDescription = {"en": "Desc"};
  operation.pimOwnerClass = "http://class";
  operation.pimDatatype = "xsd:string";

  const before = {
    "http://schema": {
      "iri": "http://schema",
      "types": ["pim-schema"],
      "pimParts": ["http://class"],
    },
    "http://class": {
      "iri": "http://class",
      "types": ["pim-class"],
    },
  };

  let counter = 0;
  const actual = await executePimCreateAttribute(
    (name) => "http://localhost/" + ++counter,
    wrapResourcesWithReader(before),
    operation);

  expect(actual.failed).toBeFalsy();
  expect(actual.created).toEqual({
    "http://localhost/1": {
      "iri": "http://localhost/1",
      "types": ["pim-attribute"],
      "pimInterpretation": operation.pimInterpretation,
      "pimTechnicalLabel": operation.pimTechnicalLabel,
      "pimHumanLabel": operation.pimHumanLabel,
      "pimHumanDescription": operation.pimHumanDescription,
      "pimOwnerClass": operation.pimOwnerClass,
      "pimDatatype": operation.pimDatatype,
    },
  });
  expect(actual.changed).toEqual({
    "http://schema": {
      "iri": "http://schema",
      "types": ["pim-schema"],
      "pimParts": ["http://class", "http://localhost/1"],
    },
  });
  expect(actual.deleted).toEqual([]);
  expect(isPimCreateAttributeResult(actual.operationResult)).toBeTruthy();
  const result = actual.operationResult as PimCreateAttributeResult;
  expect(result.createdPimAttribute).toEqual("http://localhost/1");
});

function wrapResourcesWithReader(
  resources: { [iri: string]: any },
): CoreResourceReader {
  return new ReadOnlyMemoryStore(resources);
}
