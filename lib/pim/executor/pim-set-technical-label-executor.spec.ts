import {CoreResourceReader, ReadOnlyMemoryStore} from "../../core";
import {PimSetTechnicalLabel} from "../operation";
import {
  executePimSetTechnicalLabel,
} from "./pim-set-technical-label-executor";
import * as PIM from "../pim-vocabulary";

test("Update resource technical label.", async () => {
  const operation = new PimSetTechnicalLabel(
  );
  operation.pimResource = "http://localhost/1";
  operation.pimTechnicalLabel = "NewLabel";

  const before = {
    "http://schema": {
      "iri": "http://schema",
      "types": [PIM.SCHEMA],
      "pimParts": ["http://class", "http://localhost/1"],
    },
    "http://class": {
      "iri": "http://class",
      "types": [PIM.CLASS],
    },
    "http://localhost/1": {
      "iri": "http://localhost/1",
      "types": [PIM.ATTRIBUTE],
      "pimOwnerClass": "http://class",
      "pimTechnicalLabel": "OldLabel",
    },
  };

  const actual = await executePimSetTechnicalLabel(
    wrapResourcesWithReader(before),
    undefined, operation);

  expect(actual.failed).toBeFalsy();
  expect(actual.created).toEqual({});
  expect(actual.changed).toEqual({
    "http://localhost/1": {
      "iri": "http://localhost/1",
      "types": [PIM.ATTRIBUTE],
      "pimOwnerClass": "http://class",
      "pimTechnicalLabel": "NewLabel",
    },
  });
  expect(actual.deleted).toEqual([]);
});

function wrapResourcesWithReader(
  resources: { [iri: string]: any },
): CoreResourceReader {
  return ReadOnlyMemoryStore.create(resources);
}
