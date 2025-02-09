import { describe, expect, test } from "vitest";
import { UiClass, UiClassProfile, UiVocabulary, UiVocabularyType } from "./ui-model";
import { buildProfileTree, splitByModel } from "./ui-model-derived";

describe("splitByModel", () => {

  const first: UiVocabulary = {
    baseIri: null,
    displayColor: "#00f",
    displayLabel: "C First model",
    dsIdentifier: "8d8xl",
    vocabularyType: UiVocabularyType.Default,
  };

  const second: UiVocabulary = {
    baseIri: null,
    displayColor: "#00f",
    displayLabel: "B Second model",
    dsIdentifier: "jtnzl",
    vocabularyType: UiVocabularyType.Default,
  };

  const third: UiVocabulary = {
    baseIri: null,
    displayColor: "#00f",
    displayLabel: "A Third model",
    dsIdentifier: "knaid",
    vocabularyType: UiVocabularyType.Default,
  };

  test("Basic test.", () => {
    const one: UiClass = {
      dsIdentifier: "one",
      vocabulary: first,
      displayLabel: "",
      iri: "",
      visualDsIdentifiers: null,
    };
    const two: UiClass = {
      dsIdentifier: "two",
      vocabulary: first,
      displayLabel: "",
      iri: "",
      visualDsIdentifiers: null,
    };
    const three: UiClass = {
      dsIdentifier: "three",
      vocabulary: second,
      displayLabel: "",
      iri: "",
      visualDsIdentifiers: null,
    };
    const four: UiClass = {
      dsIdentifier: "four",
      vocabulary: third,
      displayLabel: "",
      iri: "",
      visualDsIdentifiers: null,
    };
    //
    const actual = splitByModel([one, two, three, four]);
    const expected = [{
      vocabulary: third,
      items: [four],
    }, {
      vocabulary: second,
      items: [three],
    }, {
      vocabulary: first,
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
    const first: UiVocabulary = {
      baseIri: null,
      displayColor: "#00f",
      displayLabel: "C First model",
      dsIdentifier: "8d8xl",
      vocabularyType: UiVocabularyType.Default,
    };

    const one: UiClass = {
      dsIdentifier: "one",
      vocabulary: first,
      displayLabel: "One",
      iri: "",
      visualDsIdentifiers: null,
    };
    const two: UiClassProfile = {
      dsIdentifier: "two",
      vocabulary: first,
      displayLabel: "Two",
      iri: "",
      visualDsIdentifiers: null,
      profiles: [{
        profileOf: {
          entityDsIdentifier: "one",
          vocabularyDsIdentifier: first.dsIdentifier,
        }
      }],
    };
    const three: UiClass = {
      dsIdentifier: "three",
      vocabulary: first,
      displayLabel: "Three",
      iri: "",
      visualDsIdentifiers: null,
    };
    const four: UiClassProfile = {
      dsIdentifier: "four",
      vocabulary: first,
      displayLabel: "Four",
      iri: "",
      visualDsIdentifiers: null,
      profiles: [{
        profileOf: {
          entityDsIdentifier: "three",
          vocabularyDsIdentifier: first.dsIdentifier,
        }
      }],
    };
    const five: UiClassProfile = {
      dsIdentifier: "five",
      vocabulary: first,
      displayLabel: "Five",
      iri: "",
      visualDsIdentifiers: null,
      profiles: [{
        profileOf: {
          entityDsIdentifier: "four",
          vocabularyDsIdentifier: first.dsIdentifier,
        }
      }, {
        profileOf: {
          entityDsIdentifier: "one",
          vocabularyDsIdentifier: first.dsIdentifier,
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
