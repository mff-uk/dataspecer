import {
  CoreResource,
  CoreModelReader,
  createEmptyCoreResource,
} from "../../core";
import {asPimCreateClass} from "../operation";
import {executePimCreateClass} from "./pim-create-class-executor";

test("Create class.", async () => {
  const operation = asPimCreateClass(createEmptyCoreResource());
  operation.pimInterpretation = "class-type";
  operation.pimTechnicalLabel = "my-class";
  operation.pimHumanLabel = {"en": "Label"};
  operation.pimHumanDescription = {"en": "Desc"};

  const before = {
    "http://schema": {
      "iri": "http://schema",
      "types": ["pim-schema"],
      "pimParts": [],
    },
  };

  let counter = 0;
  const actual = await executePimCreateClass(
    (name) => "http://localhost/" + ++counter,
    wrapResourcesWithReader(before),
    operation);

  const expected = {
    "http://localhost/1": {
      "iri": "http://localhost/1",
      "types": ["pim-class"],
      "pimInterpretation": operation.pimInterpretation,
      "pimTechnicalLabel": operation.pimTechnicalLabel,
      "pimHumanLabel": operation.pimHumanLabel,
      "pimHumanDescription": operation.pimHumanDescription,
      "pimExtends": [],
    },
    "http://schema": {
      "iri": "http://schema",
      "types": ["pim-schema"],
      "pimParts": ["http://localhost/1"],
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

