import { describe, expect, test } from "vitest";
import { UiClass, UiClassProfile, UiModel, UiModelType } from "./ui-model";
import { buildProfileTree, splitByModel } from "./ui-model-derived";

describe("splitByModel", () => {

  const first: UiModel = {
    baseIri: null,
    displayColor: "#00f",
    displayLabel: "C First model",
    dsIdentifier: "8d8xl",
    modelType: UiModelType.Default,
  };

  const second: UiModel = {
    baseIri: null,
    displayColor: "#00f",
    displayLabel: "B Second model",
    dsIdentifier: "jtnzl",
    modelType: UiModelType.Default,
  };

  const third: UiModel = {
    baseIri: null,
    displayColor: "#00f",
    displayLabel: "A Third model",
    dsIdentifier: "knaid",
    modelType: UiModelType.Default,
  };

  test("Basic test.", () => {
    const one: UiClass = {
      dsIdentifier: "one",
      model: first,
      displayLabel: "",
      iri: "",
      visualDsIdentifier: null,
    };
    const two: UiClass = {
      dsIdentifier: "two",
      model: first,
      displayLabel: "",
      iri: "",
      visualDsIdentifier: null,
    };
    const three: UiClass = {
      dsIdentifier: "three",
      model: second,
      displayLabel: "",
      iri: "",
      visualDsIdentifier: null,
    };
    const four: UiClass = {
      dsIdentifier: "four",
      model: third,
      displayLabel: "",
      iri: "",
      visualDsIdentifier: null,
    };
    //
    const actual = splitByModel([one, two, three, four]);
    const expected = [{
      model: third,
      items: [four],
    }, {
      model: second,
      items: [three],
    }, {
      model: first,
      items: [one, two],
    }];
    //
    expect(actual).toStrictEqual(expected);
  });

});

describe("prepareForListing", () => {

  test("Basic test.", () => {

  });

});

describe("buildProfileTree", () => {

  test("Basic test.", () => {
    const first: UiModel = {
      baseIri: null,
      displayColor: "#00f",
      displayLabel: "C First model",
      dsIdentifier: "8d8xl",
      modelType: UiModelType.Default,
    };

    const one: UiClass = {
      dsIdentifier: "one",
      model: first,
      displayLabel: "One",
      iri: "",
      visualDsIdentifier: null,
    };
    const two: UiClassProfile = {
      dsIdentifier: "two",
      model: first,
      displayLabel: "Two",
      iri: "",
      visualDsIdentifier: null,
      profiles: [{
        profileOf: {
          entityDsIdentifier: "one",
          modelDsIdentifier: first.dsIdentifier,
        }
      }],
    };
    const three: UiClass = {
      dsIdentifier: "three",
      model: first,
      displayLabel: "Three",
      iri: "",
      visualDsIdentifier: null,
    };
    const four: UiClassProfile = {
      dsIdentifier: "four",
      model: first,
      displayLabel: "Four",
      iri: "",
      visualDsIdentifier: null,
      profiles: [{
        profileOf: {
          entityDsIdentifier: "three",
          modelDsIdentifier: first.dsIdentifier,
        }
      }],
    };
    const five: UiClassProfile = {
      dsIdentifier: "five",
      model: first,
      displayLabel: "Five",
      iri: "",
      visualDsIdentifier: null,
      profiles: [{
        profileOf: {
          entityDsIdentifier: "four",
          modelDsIdentifier: first.dsIdentifier,
        }
      }, {
        profileOf: {
          entityDsIdentifier: "one",
          modelDsIdentifier: first.dsIdentifier,
        }
      }],
    };
    //
    const actual = buildProfileTree([one, three], [two, four, five]);
    const expected = [{
      node: one,
      children: [{
        node: two,
        children: [],
      }, {
        node: five,
        children: [],
      }],
    }, {
      node: three,
      children: [{
        node: four,
        children: [{
          node: five,
          children: [],
        }],
      }],
    }];
    //
    expect(actual).toStrictEqual(expected);
  });

});
