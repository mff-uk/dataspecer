import {
  CoreResource,
  CoreResourceReader,
  ReadOnlyMemoryStore,
} from "../../core";
import { PimDeleteAssociation } from "../operation";
import { executePimDeleteAssociation } from "./pim-delete-association-executor";
import * as PIM from "../pim-vocabulary";

test("Delete association.", async () => {
  const operation = new PimDeleteAssociation();
  operation.pimAssociation = "http://localhost/3";

  const before = {
    "http://schema": {
      iri: "http://schema",
      types: [PIM.SCHEMA],
      pimParts: [
        "http://class",
        "http://left",
        "http://right",
        "http://localhost/3",
        "http://localhost/1",
        "http://localhost/2",
      ],
    },
    "http://localhost/3": {
      iri: "http://localhost/3",
      types: [PIM.ASSOCIATION],
      pimEnd: ["http://localhost/1", "http://localhost/2"],
    },
    "http://localhost/2": {
      iri: "http://localhost/2",
      types: [PIM.ASSOCIATION_END],
      pimPart: "http://right",
    },
    "http://localhost/1": {
      iri: "http://localhost/1",
      types: [PIM.ASSOCIATION_END],
      pimPart: "http://left",
    },
  };

  const actual = await executePimDeleteAssociation(
    wrapResourcesWithReader(before),
    undefined,
    operation
  );

  expect(actual.failed).toBeFalsy();
  expect(actual.created).toEqual({});
  expect(actual.changed).toEqual({
    "http://schema": {
      iri: "http://schema",
      types: [PIM.SCHEMA],
      pimParts: ["http://class", "http://left", "http://right"],
    },
  });
  expect(actual.deleted.sort()).toEqual(
    ["http://localhost/1", "http://localhost/2", "http://localhost/3"].sort()
  );
});

function wrapResourcesWithReader(resources: {
  [iri: string]: CoreResource;
}): CoreResourceReader {
  return ReadOnlyMemoryStore.create(resources);
}
