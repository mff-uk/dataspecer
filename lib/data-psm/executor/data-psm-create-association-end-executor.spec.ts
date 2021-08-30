import {CoreResourceReader, createCoreResource} from "../../core";
import {asDataPsmCreateAssociationEnd} from "../operation";
import {
  executesDataPsmCreateAssociationEnd,
} from "./data-psm-create-association-end-executor";
import {ReadOnlyMemoryStore} from "../../core/store/memory-store";

test("Create data PSM association-end.", async () => {
  const operation = asDataPsmCreateAssociationEnd(createCoreResource());
  operation.dataPsmInterpretation = "attribute";
  operation.dataPsmTechnicalLabel = "name";
  operation.dataPsmHumanLabel = {"en": "Label"};
  operation.dataPsmHumanDescription = {"en": "Desc"};
  operation.dataPsmOwner = "http://class";

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
  const actual = await executesDataPsmCreateAssociationEnd(
    (name) => "http://localhost/" + ++counter,
    wrapResourcesWithReader(before),
    operation);

  expect(actual.failed).toBeFalsy();
  expect(actual.created).toEqual({
    "http://localhost/1": {
      "iri": "http://localhost/1",
      "types": ["data-psm-association-end"],
      "dataPsmInterpretation": operation.dataPsmInterpretation,
      "dataPsmTechnicalLabel": operation.dataPsmTechnicalLabel,
      "dataPsmHumanLabel": operation.dataPsmHumanLabel,
      "dataPsmHumanDescription": operation.dataPsmHumanDescription,
    },
  });
  expect(actual.changed).toEqual({
    "http://schema": {
      "iri": "http://schema",
      "types": ["data-psm-schema"],
      "dataPsmParts": ["http://class", "http://localhost/1"],
    },
    "http://class": {
      "iri": "http://class",
      "types": ["data-psm-class"],
      "dataPsmParts": ["http://localhost/1"],
    },
  });
  expect(actual.deleted).toEqual([]);
});

function wrapResourcesWithReader(
  resources: { [iri: string]: any },
): CoreResourceReader {
  return new ReadOnlyMemoryStore(resources);
}
