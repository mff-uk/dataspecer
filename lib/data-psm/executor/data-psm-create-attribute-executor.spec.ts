import {createEmptyCoreResource} from "../../core";
import {asDataPsmCreateAttribute} from "../operation";
import {
  executesDataPsmCreateAttribute,
} from "./data-psm-create-attribute-executor";
import {wrapResourcesWithReader} from "./data-psm-executor-utils-spec";

test("Create data PSM attribute.", async () => {
  const operation = asDataPsmCreateAttribute(createEmptyCoreResource());
  operation.dataPsmInterpretation = "attribute";
  operation.dataPsmTechnicalLabel = "name";
  operation.dataPsmHumanLabel = {"en": "Label"};
  operation.dataPsmHumanDescription = {"en": "Desc"};
  operation.dataPsmOwner = "http://class";
  operation.dataPsmDatatype = "xsd:string";

  const before = {
    "http://schema": {
      "iri": "http://schema",
      "types": ["data-psm-schema"],
      "dataPsmParts": ["http://class"],
    },
    "http://class": {
      "iri": "http://class",
      "types": ["data-psm-class"],
      "dataPsmParts": [],
    },
  };

  let counter = 0;
  const actual = await executesDataPsmCreateAttribute(
    (name) => "http://localhost/" + ++counter,
    wrapResourcesWithReader(before),
    operation);

  const expected = {
    "http://schema": {
      "iri": "http://schema",
      "types": ["data-psm-schema"],
      "dataPsmParts": [
        "http://class", "http://localhost/1",
      ],
    },
    "http://class": {
      "iri": "http://class",
      "types": ["data-psm-class"],
      "dataPsmParts": ["http://localhost/1"],
    },
    "http://localhost/1": {
      "iri": "http://localhost/1",
      "types": ["data-psm-attribute"],
      "dataPsmInterpretation": operation.dataPsmInterpretation,
      "dataPsmTechnicalLabel": operation.dataPsmTechnicalLabel,
      "dataPsmHumanLabel": operation.dataPsmHumanLabel,
      "dataPsmHumanDescription": operation.dataPsmHumanDescription,
      "dataPsmDatatype": operation.dataPsmDatatype,
    },
  };

  expect(actual.failed).toBeFalsy();
  expect(actual.changedResources).toEqual(expected);
});
