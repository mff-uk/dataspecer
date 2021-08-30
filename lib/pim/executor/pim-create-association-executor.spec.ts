import {
  CoreResourceReader,
  createCoreResource,
} from "../../core";
import {asPimCreateAssociation} from "../operation";
import {executesPimCreateAssociation} from "./pim-create-association-executor";
import {ReadOnlyMemoryStore} from "../../core/store/memory-store";

test("Create association.", async () => {
  const operation = asPimCreateAssociation(createCoreResource());
  operation.pimInterpretation = "attribute";
  operation.pimTechnicalLabel = "name";
  operation.pimHumanLabel = {"en": "Label"};
  operation.pimHumanDescription = {"en": "Desc"};
  operation.pimAssociationEnds = ["http://left", "http://right"];

  const before = {
    "http://schema": {
      "iri": "http://schema",
      "types": ["pim-schema"],
      "pimParts": ["http://class", "http://left", "http://right"],
    },
    "http://left": {
      "iri": "http://left",
      "types": ["pim-class"],
    },
    "http://right": {
      "iri": "http://right",
      "types": ["pim-class"],
    },
  };

  let counter = 0;
  const actual = await executesPimCreateAssociation(
    (name) => "http://localhost/" + ++counter,
    wrapResourcesWithReader(before),
    operation);

  expect(actual.failed).toBeFalsy();
  expect(actual.created).toEqual({
    "http://localhost/3": {
      "iri": "http://localhost/3",
      "types": ["pim-association"],
      "pimInterpretation": operation.pimInterpretation,
      "pimTechnicalLabel": operation.pimTechnicalLabel,
      "pimHumanLabel": operation.pimHumanLabel,
      "pimHumanDescription": operation.pimHumanDescription,
      "pimEnd": ["http://localhost/1", "http://localhost/2"],
    },
    "http://localhost/2": {
      "iri": "http://localhost/2",
      "types": ["pim-association-end"],
      "pimPart": "http://right",
    },
    "http://localhost/1": {
      "iri": "http://localhost/1",
      "types": ["pim-association-end"],
      "pimPart": "http://left",
    },
  });
  expect(actual.changed).toEqual({
    "http://schema": {
      "iri": "http://schema",
      "types": ["pim-schema"],
      "pimParts": [
        "http://class", "http://left", "http://right",
        "http://localhost/3", "http://localhost/1", "http://localhost/2",
      ],
    },
  });
  expect(actual.deleted).toEqual([]);
});

function wrapResourcesWithReader(
  resources: { [iri: string]: any },
): CoreResourceReader {
  return new ReadOnlyMemoryStore(resources);
}
