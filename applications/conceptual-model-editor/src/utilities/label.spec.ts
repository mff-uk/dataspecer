import { describe, expect, test } from "vitest";

import { Entities, EntityModel } from "@dataspecer/core-v2";

import { createGetModelLabel, sanitizeDuplicitiesInRepresentativeLabels } from "./label";
import { CmeSemanticModel, CmeSemanticModelType } from "../dataspecer/cme-model";

class EntityModelMock implements EntityModel {

  identifier: string;

  alias: string | null;

  constructor(identifier: string, alias: string | null) {
    this.identifier = identifier;
    this.alias = alias;
  }

  getEntities(): Entities {
    throw new Error("Method not implemented.");
  }

  subscribeToChanges(): () => void {
    throw new Error("Method not implemented.");
  }

  getId(): string {
    return this.identifier;
  }

  getAlias(): string | null {
    return this.alias;
  }

  setAlias(): void {
    throw new Error("Method not implemented.");
  }

}

describe("createGetModelLabel", () => {

  test("Get model label for undefined.", () => {
    const getLabel = createGetModelLabel((value) => value);
    const actual = getLabel(undefined);
    expect(actual).toStrictEqual({});
  });

  test("Get model label from alias.", () => {
    const getLabel = createGetModelLabel((value) => value);
    const actual = getLabel(new EntityModelMock("", "alias"));
    expect(actual).toStrictEqual({ "": "alias" });
  });

  test("Get model label from identifier.", () => {
    const getLabel = createGetModelLabel((text, ...args) => text + " " + args.join(" "));
    const actual = getLabel(new EntityModelMock("1234", null));
    expect(actual).toStrictEqual({ "": "model-service.model-label-from-id 1234" });
  });

});

describe("sanitizeDuplicitiesInRepresentativeLabels", () => {

  test("Sanitize label duplicities.", () => {

    const one: CmeSemanticModel = {
      dsIdentifier: "vocabulary-1",
      displayLabel: { "": "one" },
      dsModelType: CmeSemanticModelType.Default,
      displayColor: "",
      baseIri: null,
    };

    const two: CmeSemanticModel = {
      dsIdentifier: "vocabulary-2",
      displayLabel: { "": "two" },
      dsModelType: CmeSemanticModelType.Default,
      displayColor: "",
      baseIri: null,
    };

    const actual = sanitizeDuplicitiesInRepresentativeLabels([one, two], [{
      identifier: "1",
      iri: "iri-1",
      label: { "cs": "", "en": "", "de": "eins" },
      vocabularyDsIdentifier: one.dsIdentifier,
    }, {
      identifier: "2",
      iri: "iri-2",
      label: { "cs": "", "en": "", "de": "zwei" },
      vocabularyDsIdentifier: two.dsIdentifier,
    }, {
      identifier: "3",
      iri: "iri-3",
      label: { "cs": "", "en": "Different", "de": "drei" },
      vocabularyDsIdentifier: two.dsIdentifier,
    }]);

    const expected = [{
      identifier: "1",
      iri: "iri-1",
      label: { "cs": "[one]", "en": "[one]", "de": "eins" },
      vocabularyDsIdentifier: one.dsIdentifier,
    }, {
      identifier: "2",
      iri: "iri-2",
      label: { "cs": "[two] (iri-2)", "en": "[two]", "de": "zwei" },
      vocabularyDsIdentifier: two.dsIdentifier,
    }, {
      identifier: "3",
      iri: "iri-3",
      label: { "cs": "[two] (iri-3)", "en": "Different", "de": "drei" },
      vocabularyDsIdentifier: two.dsIdentifier,
    }];

    expect(actual).toStrictEqual(expected);

  });

});

