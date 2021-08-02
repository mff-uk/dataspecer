import {createEmptyCoreResource} from "../../core";
import {asDataPsmDeleteAssociationEnd} from "../operation";
import {
  executesDataPsmDeleteAssociationEnd,
} from "./data-psm-delete-association-end-executor";
import {wrapResourcesWithReader} from "./data-psm-executor-utils-spec";

test("Delete data PSM association-end.", async () => {
  const operation = asDataPsmDeleteAssociationEnd(createEmptyCoreResource());
  operation.dataPsmOwner = "http://class";
  operation.dataPsmAssociationEnd = "http://association-end";

  const before = {
    "http://schema": {
      "iri": "http://schema",
      "types": ["data-psm-schema"],
      "dataPsmParts": ["http://class", "http://association-end"],
    },
    "http://class": {
      "iri": "http://class",
      "types": ["data-psm-class"],
      "dataPsmParts": ["http://association-end"],
    },
    "http://association-end": {
      "iri": "http://association-end",
      "types": ["data-psm-association-end"],
    },
  };

  const actual = await executesDataPsmDeleteAssociationEnd(
    undefined,
    wrapResourcesWithReader(before),
    operation);

  const expected = {
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

  expect(actual.failed).toBeFalsy();
  expect(actual.changedResources).toEqual(expected);
  expect(actual.deletedResource).toEqual(["http://association-end"]);
});
