import { describe, expect, test } from "vitest";

import { Entities, EntityModel } from "@dataspecer/core-v2";
import { HexColor, RepresentedEntityIdentifier, VisualEntity, VisualModel, VisualModelData, VisualModelDataVersion } from "@dataspecer/core-v2/visual-model";

import { UiModelType } from "./ui-model";
import { configuration } from "../../application";
import { UiModelServiceState, onAddEntityModels, onAddVisualEntity, onAddVisualModel, onChangeVisualModel, onRemoveEntityModel, onRemoveVisualEntity, onRemoveVisualModel } from "./ui-model-service";
import { LanguageString } from "@dataspecer/core-v2/semantic-model/concepts";

describe("initializeState", () => {

  test("No test.", () => {
    // As of now this test is empty as we need instance of
    // SemanticModelAggregatorView which is not easy to come by.
    // See https://github.com/mff-uk/dataspecer/issues/838
  });

});

describe("onChangeSemanticModel", () => {

  test("No test.", () => {
    // This is empty as called function semanticModelChangeToUiState
    // is tested in another file.
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

  private represented: Record<string, VisualEntity>;

  constructor(modelColors: Record<string, HexColor>, represented: Record<string, VisualEntity>) {
    this.modelColors = modelColors;
    this.represented = represented;
  }

  getIdentifier(): string {
    throw new Error("Method not implemented.");
  }

  getVisualEntity(): VisualEntity | null {
    throw new Error("Method not implemented.");
  }

  getVisualEntityForRepresented(identifier: RepresentedEntityIdentifier): VisualEntity | null {
    return this.represented[identifier] ?? null;
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

describe("onAddEntityModel", () => {

  test("Add first models.", () => {
    const previous: UiModelServiceState = {
      defaultWriteModel: null,
      models: [],
      classes: [],
      classProfiles: [],
      attributes: [],
      attributeProfiles: [],
      associations: [],
      associationProfiles: [],
      generalizations: [],
    };

    const localModel = new MemoryModel(
      "8d8xl", "Local model", {});

    const secondModel = new MemoryModel(
      "jtnzl", "Second model", {});

    const visualModel = new VisualModelMock({
      "8d8xl": "#000000",
      "jtnzl": "#00aa01",
    }, {})

    const actual = onAddEntityModels(
      previous, visualModel, [secondModel, localModel]);

    const expected: UiModelServiceState = {
      ...previous,
      models: [{
        dsIdentifier: "8d8xl",
        displayLabel: "Local model",
        displayColor: "#000000",
        modelType: UiModelType.Default,
        baseIri: null,
      }, {
        dsIdentifier: "jtnzl",
        displayLabel: "Second model",
        displayColor: "#00aa01",
        modelType: UiModelType.Default,
        baseIri: null,
      }]
    };

    expect(actual).toStrictEqual(expected);
  });

  test("Add model which is not in a visual model.", () => {
    const previous: UiModelServiceState = {
      defaultWriteModel: null,
      models: [],
      classes: [],
      classProfiles: [],
      attributes: [],
      attributeProfiles: [],
      associations: [],
      associationProfiles: [],
      generalizations: [],
    };

    const localModel = new MemoryModel(
      "8d8xl", "Local model", {});

    const visualModel = new VisualModelMock({}, {});

    const actual = onAddEntityModels(
      previous, visualModel, [localModel]);

    const expected: UiModelServiceState = {
      ...previous,
      defaultWriteModel: null,
      models: [{
        dsIdentifier: "8d8xl",
        displayLabel: "Local model",
        displayColor: configuration().defaultModelColor,
        modelType: UiModelType.Default,
        baseIri: null,
      }]
    };

    expect(actual).toStrictEqual(expected);
  });

});

describe("onRemoveEntityModel", () => {

  test("Remove model with entities.", () => {
    const model = {
      dsIdentifier: "8d8xl",
      displayLabel: "Local model",
      displayColor: configuration().defaultModelColor,
      modelType: UiModelType.InMemorySemanticModel,
      baseIri: "",
    };

    const previous: UiModelServiceState = {
      defaultWriteModel: model,
      models: [model],
      classes: [{
        dsIdentifier: "0000",
        model,
        displayLabel: "",
        iri: "",
        visualDsIdentifier: null,
      }],
      classProfiles: [],
      attributes: [],
      attributeProfiles: [],
      associations: [],
      associationProfiles: [],
      generalizations: [],
    };

    const actual = onRemoveEntityModel(previous, ["8d8xl"]);

    const expected: UiModelServiceState = {
      ...previous,
      defaultWriteModel: null,
      models: [],
      classes: [],
    };

    expect(actual).toStrictEqual(expected);
  });

});

describe("onAddVisualModel", () => {

  test("Should throw on a call.", () => {
    expect(() => onAddVisualModel()).toThrowError();
  });

});

describe("onChangeVisualModel", () => {

  test("Default test.", () => {
    const model = {
      dsIdentifier: "8d8xl",
      displayLabel: "Local model",
      displayColor: configuration().defaultModelColor,
      modelType: UiModelType.InMemorySemanticModel,
      baseIri: "",
    };

    const previous: UiModelServiceState = {
      defaultWriteModel: model,
      models: [model],
      classes: [{
        dsIdentifier: "0000",
        model,
        displayLabel: "",
        iri: "",
        visualDsIdentifier: null,
      }],
      classProfiles: [],
      attributes: [],
      attributeProfiles: [],
      associations: [],
      associationProfiles: [],
      generalizations: [],
    };

    const actual = onChangeVisualModel(previous, "8d8xl", "#000112");

    const expectedModel = {
      ...model,
      displayColor: "#000112",
    };

    const expected: UiModelServiceState = {
      ...previous,
      models: [expectedModel],
      classes: [{
        ...previous.classes[0],
        model: expectedModel,
      }],
    };

    expect(actual).toStrictEqual(expected);
  });

});

describe("onRemoveVisualModel", () => {

  test("Should throw on a call.", () => {
    expect(() => onRemoveVisualModel()).toThrowError();
  });

});

describe("onAddVisualEntity", () => {

  test("Default test.", () => {
    const model = {
      dsIdentifier: "8d8xl",
      displayLabel: "Local model",
      displayColor: configuration().defaultModelColor,
      modelType: UiModelType.InMemorySemanticModel,
      baseIri: "",
    };

    const previous: UiModelServiceState = {
      defaultWriteModel: null,
      models: [model],
      classes: [{
        dsIdentifier: "0000",
        model,
        displayLabel: "",
        iri: "",
        visualDsIdentifier: null,
      }],
      classProfiles: [],
      attributes: [],
      attributeProfiles: [],
      associations: [],
      associationProfiles: [],
      generalizations: [],
    };

    const actual = onAddVisualEntity(previous, "8d8xl", "0000", "vis-id");

    const expected: UiModelServiceState = {
      ...previous,
      classes: [{
        ...previous.classes[0],
        visualDsIdentifier: "vis-id"
      }],
    };

    expect(actual).toStrictEqual(expected);
  });

});

describe("onRemoveVisualEntity", () => {

  test("Default test.", () => {
    const model = {
      dsIdentifier: "8d8xl",
      displayLabel: "Local model",
      displayColor: configuration().defaultModelColor,
      modelType: UiModelType.Default,
      baseIri: "",
    };

    const previous: UiModelServiceState = {
      defaultWriteModel: model,
      models: [model],
      classes: [{
        dsIdentifier: "0000",
        model,
        displayLabel: "",
        iri: "",
        visualDsIdentifier: "vis-id",
      }],
      classProfiles: [],
      attributes: [],
      attributeProfiles: [],
      associations: [],
      associationProfiles: [],
      generalizations: [],
    };

    const actual = onRemoveVisualEntity(previous, "8d8xl", "0000");

    const expected: UiModelServiceState = {
      ...previous,
      classes: [{
        ...previous.classes[0],
        visualDsIdentifier: null
      }],
    };

    expect(actual).toStrictEqual(expected);
  });

});
