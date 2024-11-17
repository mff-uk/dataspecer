import { expect, test } from "vitest";

import { Entities, EntityModel } from "@dataspecer/core-v2";

import { createGetModelLabel, sanitizeDuplicitiesInEntityLabels } from "./label";

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

test("Sanitize label duplicities.", () => {
  const modelOne = new EntityModelMock("model-1", null);
  const modelTwo = new EntityModelMock("model-2", null);

  const actual = sanitizeDuplicitiesInEntityLabels([
    { identifier: "model-1", label: { "": "one" } },
    { identifier: "model-2", label: { "": "two" } },
  ], [
    {
      identifier: "1",
      iri: "iri-1",
      label: { "cs": "", "en": "", "de": "eins" },
      model: modelOne
    }, {
      identifier: "2",
      iri: "iri-2",
      label: { "cs": "", "en": "", "de": "zwei" },
      model: modelTwo
    }, {
      identifier: "3",
      iri: "iri-3",
      label: { "cs": "", "en": "Different", "de": "drei" },
      model: modelTwo
    }
  ]);

  const expected = [    {
    identifier: "1",
    iri: "iri-1",
    label: { "cs": "[one]", "en": "[one]", "de": "eins" },
    model: modelOne
  }, {
    identifier: "2",
    iri: "iri-2",
    label: { "cs": "[two] (iri-2)", "en": "[two]", "de": "zwei" },
    model: modelTwo
  }, {
    identifier: "3",
    iri: "iri-3",
    label: { "cs": "[two] (iri-3)", "en": "Different", "de": "drei" },
    model: modelTwo
  }];

  expect(actual).toStrictEqual(expected);

});

