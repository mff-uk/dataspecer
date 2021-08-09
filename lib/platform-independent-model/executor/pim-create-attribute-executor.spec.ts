import {
  CoreResource,
  CoreModelReader,
  createEmptyCoreResource,
} from "../../core";
import {asPimCreateAttribute} from "../operation";
import {executePimCreateAttribute} from "./pim-create-attribute-executor";

test("Create attribute.", async () => {
  const operation = asPimCreateAttribute(createEmptyCoreResource());
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

  const expected = {
    "http://schema": {
      "iri": "http://schema",
      "types": ["pim-schema"],
      "pimParts": ["http://class", "http://localhost/1"],
    },
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

