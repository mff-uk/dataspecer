import { describe, expect, test } from "vitest";

import { Entities, EntityModel } from "@dataspecer/core-v2";
import { HexColor, RepresentedEntityIdentifier, VISUAL_NODE_TYPE, VisualEntity, VisualModel, VisualModelData, VisualModelDataVersion, VisualNode } from "@dataspecer/core-v2/visual-model";

import { UiVocabulary, UiVocabularyType, UiModelState } from "./ui-model";
import { createEmptyState, onChangeSemanticModels, onChangeVisualModel, onModelColorDidChange, onVisualEntitiesDidChange } from "./ui-model-state";
import { LanguageString } from "@dataspecer/core-v2/semantic-model/concepts";

const DEFAULT_MODEL_COLOR = "#00AA00";

describe("createState", () => {

  test("No test.", () => {
    // As of now this test is empty as we need instance of
    // SemanticModelAggregatorView which is not easy to come by.
    // See https://github.com/mff-uk/dataspecer/issues/838
  });

});

class MemoryModel implements EntityModel {

  identifier: string;

  alias: string | null;

  entities: Entities;

  constructor(identifier: string, alias: string | null, entities: Entities) {
    this.identifier = identifier;
    this.alias = alias;
    this.entities = entities;
  }

  getEntities(): Entities {
    return this.entities;
  }

  subscribeToChanges(): () => void {
    return () => { };
  }

  getId(): string {
    return this.identifier;
  }

  getAlias(): string | null {
    return this.alias;
  }

  setAlias(alias: string | null): void {
    this.alias = alias;
  }

}

class VisualModelMock implements VisualModel {

  private modelColors: Record<string, HexColor>;

  private represented: Record<string, VisualEntity[]>;

  constructor(modelColors: Record<string, HexColor>, represented: Record<string, VisualEntity[]>) {
    this.modelColors = modelColors;
    this.represented = represented;
  }

  getIdentifier(): string {
    throw new Error("Method not implemented.");
  }

  getVisualEntity(): VisualEntity | null {
    throw new Error("Method not implemented.");
  }

  getVisualEntitiesForRepresented(identifier: RepresentedEntityIdentifier): VisualEntity[] {
    return this.represented[identifier] ?? [];
  }

  hasVisualEntityForRepresented(identifier: RepresentedEntityIdentifier): boolean {
    return this.getVisualEntitiesForRepresented(identifier).length > 0;
  }

  getVisualEntities(): Map<string, VisualEntity> {
    throw new Error("Method not implemented.");
  }

  getModelColor(identifier: string): HexColor | null {
    return this.modelColors[identifier] ?? null;
  }

  getModelsData(): Map<string, VisualModelData> {
    throw new Error("Method not implemented.");
  }

  getInitialModelVersion(): VisualModelDataVersion {
    throw new Error("Method not implemented.");
  }

  getTypes(): string[] {
    throw new Error("Method not implemented.");
  }

  getId(): string {
    return this.getIdentifier();
  }

  serializeModel(): object {
    throw new Error("Method not implemented.");
  }

  deserializeModel(): this {
    throw new Error("Method not implemented.");
  }

  subscribeToChanges(): () => void {
    return () => { };
  }

  getLabel(): LanguageString | null {
    throw new Error("Method not implemented.");
  }

  setLabel(): void {
    throw new Error("Method not implemented.");
  }

}

describe("onChangeSemanticModels", () => {

  test("Add semantic model.", () => {
    const visualModel = new VisualModelMock({ "0": "#000000" }, {});
    const actual = onChangeSemanticModels(
      "#000000", (message) => message, ["en"],
      { ...createEmptyState(), visualModel },
      [new MemoryModel("0", "zero", {})]
    );
    const expected: UiModelState = {
      ...createEmptyState(),
      vocabularies: [{
        dsIdentifier: "0",
        displayLabel: "zero",
        baseIri: null,
        displayColor: "#000000",
        vocabularyType: UiVocabularyType.Default,
      }],
      visualModel
    };
    //
    expect(actual).toStrictEqual(expected);
  });

  test("Change semantic model alias.", () => {
    const visualModel = new VisualModelMock({ "0": "#000000" }, {});
    const model = new MemoryModel("0", "zero", {});

    const state = onChangeSemanticModels(
      "#000000", (message) => message, ["en"],
      { ...createEmptyState(), visualModel },
      [model]);
    model.alias = "x";

    const actual = onChangeSemanticModels(
      "#000000", (message) => message, ["en"], state, [model]);

    const expected: UiModelState = {
      ...createEmptyState(),
      visualModel,
      "vocabularies": [{
        dsIdentifier: "0",
        displayLabel: "x",
        baseIri: null,
        displayColor: "#000000",
        vocabularyType: UiVocabularyType.Default,
      }],
    };
    //
    expect(actual).toStrictEqual(expected);
  });

  test("Remove semantic model.", () => {
    const state: UiModelState = {
      ...createEmptyState(),
      "vocabularies": [{
        dsIdentifier: "0",
        displayLabel: "zero",
        baseIri: null,
        displayColor: "#000000",
        vocabularyType: UiVocabularyType.Default,
      }],
      "visualModel": null,
    };
    const actual = onChangeSemanticModels(
      "#000000", (message) => message, ["en"], state, []);
    const expected: UiModelState = {
      ...state,
      "vocabularies": [],
    };
    //
    expect(actual).toStrictEqual(expected);
  });

  test("Remove semantic model with entities.", () => {
    const vocabulary: UiVocabulary = {
      dsIdentifier: "8d8xl",
      displayLabel: "Local model",
      displayColor: DEFAULT_MODEL_COLOR,
      vocabularyType: UiVocabularyType.InMemorySemanticModel,
      baseIri: "",
    };

    const previous: UiModelState = {
      defaultWriteVocabulary: vocabulary,
      vocabularies: [vocabulary],
      classes: [{
        dsIdentifier: "0000",
        vocabulary: vocabulary,
        displayLabel: "",
        iri: "",
        visualDsIdentifiers: [],
      }],
      classProfiles: [],
      attributes: [],
      attributeProfiles: [],
      associations: [],
      associationProfiles: [],
      generalizations: [],
      visualModel: null,
    };

    const actual = onChangeSemanticModels(
      "#000000", (message) => message, ["en"], previous, []);

    const expected: UiModelState = {
      ...previous,
      defaultWriteVocabulary: null,
      vocabularies: [],
      classes: [],
    };

    expect(actual).toStrictEqual(expected);
  });

  test("Add semantic model which is not in a visual model.", () => {
    const visualModel = new VisualModelMock({}, {});

    const previous: UiModelState = {
      defaultWriteVocabulary: null,
      vocabularies: [],
      classes: [],
      classProfiles: [],
      attributes: [],
      attributeProfiles: [],
      associations: [],
      associationProfiles: [],
      generalizations: [],
      visualModel,
    };

    const localModel = new MemoryModel(
      "8d8xl", "Local model", {});

    const actual = onChangeSemanticModels(
      "#000000", (message) => message, ["en"], previous, [localModel]);

    const expected: UiModelState = {
      ...previous,
      defaultWriteVocabulary: null,
      vocabularies: [{
        dsIdentifier: "8d8xl",
        displayLabel: "Local model",
        displayColor: "#000000",
        vocabularyType: UiVocabularyType.Default,
        baseIri: null,
      }]
    };

    expect(actual).toStrictEqual(expected);
  });

});

describe("onChangeVisualModel", () => {

  test("No test.", () => {
    // This is empty as called function onChangeVisualModel just
    // recall other methods tested in a different file.
  });

});

describe("onChangeInAggregatorView", () => {

  test("No test.", () => {
    // This is empty as called function semanticModelChangeToUiState
    // is tested in another file.
  });

});

describe("onVisualEntitiesDidChange", () => {

  test("Add visual entity.", () => {
    const vocabulary : UiVocabulary = {
      dsIdentifier: "8d8xl",
      displayLabel: "Local model",
      displayColor: DEFAULT_MODEL_COLOR,
      vocabularyType: UiVocabularyType.InMemorySemanticModel,
      baseIri: "",
    };

    const previous: UiModelState = {
      defaultWriteVocabulary: null,
      vocabularies: [vocabulary],
      classes: [{
        dsIdentifier: "0000",
        vocabulary: vocabulary,
        displayLabel: "",
        iri: "",
        visualDsIdentifiers: [],
      }],
      classProfiles: [],
      attributes: [],
      attributeProfiles: [],
      associations: [],
      associationProfiles: [],
      generalizations: [],
      visualModel: null,
    };

    const actual = onVisualEntitiesDidChange([
      {
        previous: null,
        next: {
          identifier: "vis-id1",
          type: [VISUAL_NODE_TYPE],
          representedEntity: "0000"
        } as VisualNode,
      },
      {
        previous: null,
        next: {
          identifier: "vis-id2",
          type: [VISUAL_NODE_TYPE],
          representedEntity: "0000"
        } as VisualNode,
      }
    ], previous);

    const expected: UiModelState = {
      ...previous,
      classes: [{
        ...previous.classes[0],
        visualDsIdentifiers: ["vis-id1", "vis-id2"]
      }],
    };

    expect(actual).toStrictEqual(expected);
  });

  test("Remove visual entity.", () => {
    const vocabulary : UiVocabulary = {
      dsIdentifier: "8d8xl",
      displayLabel: "Local model",
      displayColor: DEFAULT_MODEL_COLOR,
      vocabularyType: UiVocabularyType.Default,
      baseIri: "",
    };

    const previous: UiModelState = {
      defaultWriteVocabulary: vocabulary,
      vocabularies: [vocabulary],
      classes: [{
        dsIdentifier: "0000",
        vocabulary: vocabulary,
        displayLabel: "",
        iri: "",
        visualDsIdentifiers: ["vis-id1", "vis-id2"],
      }],
      classProfiles: [],
      attributes: [],
      attributeProfiles: [],
      associations: [],
      associationProfiles: [],
      generalizations: [],
      visualModel: null,
    };

    const actual = onVisualEntitiesDidChange([
      {
        previous: {
          identifier: "vis-id1",
          type: [VISUAL_NODE_TYPE],
          representedEntity: "0000"
        } as VisualNode,
        next: {
          identifier: "vis-id1",
          type: [VISUAL_NODE_TYPE],
          representedEntity: "0000"
        } as VisualNode,
      },
      {
        previous: {
          identifier: "vis-id2",
          type: [VISUAL_NODE_TYPE],
          representedEntity: "0000"
        } as VisualNode,
        next: null,
      }], previous);

    const expected: UiModelState = {
      ...previous,
      classes: [{
        ...previous.classes[0],
        visualDsIdentifiers: ["vis-id1"]
      }],
    };

    expect(actual).toStrictEqual(expected);
  });

});

describe("onModelColorDidChange", () => {

  test("Default test.", () => {
    const vocabulary : UiVocabulary = {
      dsIdentifier: "8d8xl",
      displayLabel: "Local model",
      displayColor: "#ffffff",
      vocabularyType: UiVocabularyType.InMemorySemanticModel,
      baseIri: "",
    };

    const previous: UiModelState = {
      defaultWriteVocabulary: vocabulary,
      vocabularies: [vocabulary],
      classes: [{
        dsIdentifier: "0000",
        vocabulary: vocabulary,
        displayLabel: "",
        iri: "",
        visualDsIdentifiers: [],
      }],
      classProfiles: [],
      attributes: [],
      attributeProfiles: [],
      associations: [],
      associationProfiles: [],
      generalizations: [],
      visualModel: null,
    };

    const actual = onModelColorDidChange("#000000", "8d8xl", "#000112", previous);

    const expectedModel = {
      ...vocabulary,
      displayColor: "#000112",
    };

    const expected: UiModelState = {
      ...previous,
      defaultWriteVocabulary: expectedModel,
      vocabularies: [expectedModel],
      classes: [{
        ...previous.classes[0],
        vocabulary: expectedModel,
      }],
    };

    expect(actual).toStrictEqual(expected);
  });

});

test("Add semantic models and then change visual model.", () => {
  const previous: UiModelState = {
    defaultWriteVocabulary: null,
    vocabularies: [],
    classes: [],
    classProfiles: [],
    attributes: [],
    attributeProfiles: [],
    associations: [],
    associationProfiles: [],
    generalizations: [],
    visualModel: null,
  };

  const localModel = new MemoryModel(
    "8d8xl", "Local model", {});

  const secondModel = new MemoryModel(
    "jtnzl", "Second model", {});

  const visualModel = new VisualModelMock({
    "8d8xl": "#000000",
    "jtnzl": "#00aa01",
  }, {})

  const state = onChangeSemanticModels(
    "#000000", (message) => message, ["en"], previous,
    [localModel, secondModel]);

  const actual = onChangeVisualModel("#111111", visualModel, state);

  const expected: UiModelState = {
    ...previous,
    vocabularies: [{
      dsIdentifier: "8d8xl",
      displayLabel: "Local model",
      displayColor: "#000000",
      vocabularyType: UiVocabularyType.Default,
      baseIri: null,
    }, {
      dsIdentifier: "jtnzl",
      displayLabel: "Second model",
      displayColor: "#00aa01",
      vocabularyType: UiVocabularyType.Default,
      baseIri: null,
    }],
    visualModel,
  };

  expect(actual).toStrictEqual(expected);
});
