import { describe, expect, test } from "vitest";

import { HexColor, RepresentedEntityIdentifier, VISUAL_RELATIONSHIP_TYPE, VisualEntity, VisualModel, VisualModelData, VisualModelDataVersion, VisualRelationship } from "@dataspecer/core-v2/visual-model";
import { Entities, EntityModel } from "@dataspecer/core-v2";
import { AggregatedEntityWrapper, SemanticModelAggregator } from "@dataspecer/core-v2/semantic-model/aggregator";
import { SEMANTIC_MODEL_CLASS, SEMANTIC_MODEL_GENERALIZATION, SemanticModelClass, SemanticModelGeneralization } from "@dataspecer/core-v2/semantic-model/concepts";
import { LanguageString } from "@dataspecer/core/core/core-resource";

import { entityModelToUiModel, entityModelToUiState, removeVisualModelToUiState, semanticModelChangeToUiState, visualModelToUiState } from "./aggregator-to-ui-model-adapter";
import { UiAssociation, UiAssociationProfile, UiAttribute, UiAttributeProfile, UiClass, UiClassProfile, UiGeneralization, UiVocabulary, UiVocabularyType, UiModelState } from "./ui-model";
import { createEmptyState } from "./ui-model-state";

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

describe("entityModelToUiModel", () => {

  const t = (text: string) => `t:${text}`;

  test("Basic test.", () => {
    const actual = entityModelToUiModel("#111111", t,
      {
        getId: () => "abcd",
        getAlias: () => "mock model",
        getBaseIri: () => "http://base",
      } as any, {
        getModelColor: (identifier: string) => {
          return identifier + "-blue";
        },
      } as VisualModel);

    expect(actual).toStrictEqual({
      dsIdentifier: "abcd",
      displayLabel: "mock model",
      displayColor: "abcd-blue",
      vocabularyType: UiVocabularyType.Default,
      baseIri: "http://base",
    });
  });

  test("Convert a model without alias.", () => {
    const actual = entityModelToUiModel("#111111", t,
      {
        getId: () => "abcd",
        getAlias: () => null,
      } as EntityModel, {
        getModelColor: (identifier: string) => {
          return identifier + "-blue";
        },
      } as VisualModel);

    expect(actual).toStrictEqual({
      dsIdentifier: "abcd",
      displayLabel: "t:model-service.model-label-from-id",
      displayColor: "abcd-blue",
      vocabularyType: UiVocabularyType.Default,
      baseIri: null,
    });
  });

  test("Convert without a visual model.", () => {
    const actual = entityModelToUiModel("#111111", t, {
      getId: () => "abcd",
      getAlias: () => "mock model",
    } as EntityModel, null);

    expect(actual).toStrictEqual({
      dsIdentifier: "abcd",
      displayLabel: "mock model",
      displayColor: "#111111",
      vocabularyType: UiVocabularyType.Default,
      baseIri: null,
    });
  });

});

describe("entityModelToUiState", () => {

  const localModelEntities = {
    "gjicauujarm1ndo8v7": {
      "id": "gjicauujarm1ndo8v7",
      "iri": "Package",
      "type": [
        "class"
      ],
      "name": {
        "en": "Package Entity"
      },
      "description": {
        "en": "Package can contain content."
      }
    },
    "jn7hbn6e3drm1ndoil4": {
      "id": "jn7hbn6e3drm1ndoil4",
      "iri": "File",
      "type": [
        "class"
      ],
      "name": {
        "en": "File"
      },
      "description": {}
    },
    "icfwsrg699dm1ndp4o0": {
      "id": "icfwsrg699dm1ndp4o0",
      "type": [
        "relationship"
      ],
      "iri": null,
      "name": {},
      "description": {},
      "ends": [
        {
          "name": {},
          "description": {},
          "cardinality": null,
          "concept": "gjicauujarm1ndo8v7",
          "iri": null
        },
        {
          "name": {
            "en": "hasFile"
          },
          "description": {},
          "cardinality": null,
          "concept": "jn7hbn6e3drm1ndoil4",
          "iri": "aaa"
        }
      ]
    },
    "ha8yahj15lm1tnwbv2": {
      "id": "ha8yahj15lm1tnwbv2",
      "type": [
        "relationship"
      ],
      "iri": null,
      "name": {},
      "description": {},
      "ends": [
        {
          "name": {},
          "description": {},
          "concept": "gjicauujarm1ndo8v7",
          "iri": null
        },
        {
          "name": {
            "en": "Name"
          },
          "description": {},
          "concept": "http://www.w3.org/2001/XMLSchema#string",
          "iri": "name"
        }
      ]
    },
    "jau0qqop2om1tnwtba": {
      "id": "jau0qqop2om1tnwtba",
      "usageOf": "gjicauujarm1ndo8v7",
      "type": [
        "class-usage"
      ],
      "iri": "Package",
      "name": {
        "en": "Zip [P]"
      },
      "description": null,
      "usageNote": {
        "en": "Usage note."
      }
    },
    "jvb8olk53shm1udb7wv": {
      "usageNote": {
        "en": "Name profile."
      },
      "id": "jvb8olk53shm1udb7wv",
      "type": [
        "relationship-usage"
      ],
      "iri": null,
      "usageOf": "ha8yahj15lm1tnwbv2",
      "name": null,
      "description": null,
      "ends": [
        {
          "name": null,
          "description": null,
          "cardinality": null,
          "concept": null,
          "usageNote": null,
          "iri": null
        },
        {
          "name": {
            "en": "Named"
          },
          "description": null,
          "cardinality": null,
          "concept": null,
          "usageNote": null,
          "iri": "name"
        }
      ]
    },
    "g9kgr30n0km1ugv822": {
      "id": "g9kgr30n0km1ugv822",
      "iri": "CsvFile",
      "type": [
        "class"
      ],
      "name": {
        "en": "CSV File"
      },
      "description": {}
    },
    "8b7m5yz3ml5m1ugvhj5": {
      "id": "8b7m5yz3ml5m1ugvhj5",
      "iri": null,
      "child": "g9kgr30n0km1ugv822",
      "parent": "jn7hbn6e3drm1ndoil4",
      "type": [
        "generalization"
      ]
    },
    "e4xe32lyj06m2wbmps4": {
      "id": "e4xe32lyj06m2wbmps4",
      "iri": "DrainedService",
      "type": [
        "class"
      ],
      "name": {
        "en": "Drained Service"
      },
      "description": {}
    },
    "tm0pr6de2oim398f6hy": {
      "usageNote": {},
      "id": "tm0pr6de2oim398f6hy",
      "type": [
        "relationship-usage"
      ],
      "iri": null,
      "usageOf": "icfwsrg699dm1ndp4o0",
      "name": null,
      "description": null,
      "ends": [
        {
          "name": null,
          "description": null,
          "cardinality": null,
          "concept": null,
          "usageNote": null,
          "iri": null
        },
        {
          "name": {
            "en": "hasFiled"
          },
          "description": null,
          "cardinality": null,
          "concept": null,
          "usageNote": null,
          "iri": "aaa"
        }
      ]
    },
    "ib5x2ddfp9im3ugb4ks": {
      "id": "ib5x2ddfp9im3ugb4ks",
      "usageOf": "9oz2oxw29a9m3k7heco",
      "type": [
        "class-usage"
      ],
      "iri": "File",
      "name": {
        "en": "File [P]"
      },
      "description": null,
      "usageNote": null
    },
    "cjeraar9g8m3uhupii": {
      "id": "cjeraar9g8m3uhupii",
      "usageOf": "ib5x2ddfp9im3ugb4ks",
      "type": [
        "class-usage"
      ],
      "iri": "File",
      "name": null,
      "description": null,
      "usageNote": null
    },
    "qj8evoy2gahm46r8olh": {
      "usageNote": {
        "en": "No change to the profiled."
      },
      "id": "qj8evoy2gahm46r8olh",
      "type": [
        "relationship-usage"
      ],
      "iri": null,
      "usageOf": "zqjoipz78wm41t042p",
      "name": null,
      "description": null,
      "ends": [
        {
          "name": null,
          "description": null,
          "cardinality": null,
          "concept": null,
          "usageNote": null,
          "iri": null
        },
        {
          "name": null,
          "description": null,
          "cardinality": null,
          "concept": null,
          "usageNote": null,
          "iri": "crookedPoint"
        }
      ]
    }
  };

  const secondModelEntities = {
    "9oz2oxw29a9m3k7heco": {
      "id": "9oz2oxw29a9m3k7heco",
      "iri": "File",
      "type": [
        "class"
      ],
      "name": {
        "en": "File"
      },
      "description": {}
    },
    "zqjoipz78wm41t042p": {
      "id": "zqjoipz78wm41t042p",
      "type": [
        "relationship"
      ],
      "iri": null,
      "name": {},
      "description": {},
      "ends": [
        {
          "name": {},
          "description": {},
          "concept": "e4xe32lyj06m2wbmps4",
          "iri": null
        },
        {
          "name": {
            "en": "Crooked Point"
          },
          "description": {},
          "concept": "gjicauujarm1ndo8v7",
          "iri": "crookedPoint"
        }
      ]
    },
    "quvpe342ram4b5mnrf": {
      "id": "quvpe342ram4b5mnrf",
      "type": [
        "relationship"
      ],
      "iri": null,
      "name": {},
      "description": {},
      "ends": [
        {
          "name": {},
          "description": {},
          "concept": "g9kgr30n0km1ugv822",
          "iri": null
        },
        {
          "name": {
            "en": "Repulsive Area"
          },
          "description": {},
          "concept": "http://www.w3.org/2001/XMLSchema#string",
          "iri": "RepulsiveArea"
        }
      ]
    }
  };

  const localVocabulary = new MemoryModel(
    "8d8xl", "Local model", localModelEntities);

  const secondVocabulary = new MemoryModel(
    "jtnzl", "Second model", secondModelEntities);

  const aggregator = new SemanticModelAggregator();
  aggregator.addModel(localVocabulary);
  aggregator.addModel(secondVocabulary);

  const aggregates = aggregator.getView().getEntities();

  // Map represented to visual entity.
  const visualEntities: Record<string, VisualEntity> = {
    "zqjoipz78wm41t042p": {
      identifier: "0000",
      type: [VISUAL_RELATIONSHIP_TYPE],
      representedRelationship: "zqjoipz78wm41t042p",
      model: "jtnzl",
      waypoints: [],
      visualSource: "",
      visualTarget: "",
    } as VisualRelationship,
  };

  const vocabularyColors: Record<string, HexColor> = {
    "8d8xl": "#f00",
    "jtnzl": "#00f",
  };

  const visualModel = new VisualModelMock(vocabularyColors, visualEntities);

  const t = (text: string) => `t:${text}`;

  test("Basic test local model.", () => {

    const actual = entityModelToUiState(
      "#111111", t,
      [localVocabulary], [localVocabulary, secondVocabulary],
      aggregates, visualModel, ["en"]);

    const local: UiVocabulary = {
      baseIri: null,
      displayColor: "#f00",
      displayLabel: "Local model",
      dsIdentifier: "8d8xl",
      vocabularyType: UiVocabularyType.Default,
    };

    const classes: UiClass[] = [{
      displayLabel: "CSV File",
      dsIdentifier: "g9kgr30n0km1ugv822",
      iri: "CsvFile",
      vocabulary: local,
      visualDsIdentifier: null,
    }, {
      displayLabel: "Drained Service",
      dsIdentifier: "e4xe32lyj06m2wbmps4",
      iri: "DrainedService",
      vocabulary: local,
      visualDsIdentifier: null,
    }, {
      displayLabel: "File",
      dsIdentifier: "jn7hbn6e3drm1ndoil4",
      iri: "File",
      vocabulary: local,
      visualDsIdentifier: null,
    }, {
      displayLabel: "Package Entity",
      dsIdentifier: "gjicauujarm1ndo8v7",
      iri: "Package",
      vocabulary: local,
      visualDsIdentifier: null,
    }];

    const classProfiles: UiClassProfile[] = [{
      displayLabel: "File [P]",
      dsIdentifier: "ib5x2ddfp9im3ugb4ks",
      iri: "File",
      vocabulary: local,
      visualDsIdentifier: null,
      profiles: [{
        profileOf: {
          entityDsIdentifier: "9oz2oxw29a9m3k7heco",
          vocabularyDsIdentifier: "jtnzl",
        }
      }],
    }, {
      displayLabel: "File [P]",
      dsIdentifier: "cjeraar9g8m3uhupii",
      iri: "File",
      vocabulary: local,
      visualDsIdentifier: null,
      profiles: [{
        profileOf: {
          entityDsIdentifier: "ib5x2ddfp9im3ugb4ks",
          vocabularyDsIdentifier: "8d8xl",
        }
      }],
    }, {
      displayLabel: "Zip [P]",
      dsIdentifier: "jau0qqop2om1tnwtba",
      iri: "Package",
      vocabulary: local,
      visualDsIdentifier: null,
      profiles: [{
        profileOf: {
          entityDsIdentifier: "gjicauujarm1ndo8v7",
          vocabularyDsIdentifier: "8d8xl",
        }
      }],
    }];

    const attributes: UiAttribute[] = [{
      displayLabel: "Name",
      dsIdentifier: "ha8yahj15lm1tnwbv2",
      iri: "name",
      vocabulary: local,
      visualDsIdentifier: null,
      domain: {
        entityDsIdentifier: "gjicauujarm1ndo8v7",
        vocabularyDsIdentifier: local.dsIdentifier,
      },
      range: {
        dsIdentifier: "http://www.w3.org/2001/XMLSchema#string",
      },
    }];

    const attributeProfiles: UiAttributeProfile[] = [{
      displayLabel: "Named",
      dsIdentifier: "jvb8olk53shm1udb7wv",
      iri: "name",
      vocabulary: local,
      visualDsIdentifier: null,
      profiles: [{
        profileOf: {
          entityDsIdentifier: "ha8yahj15lm1tnwbv2",
          vocabularyDsIdentifier: "8d8xl",
        }
      }],
      domain: {
        entityDsIdentifier: "gjicauujarm1ndo8v7",
        vocabularyDsIdentifier: local.dsIdentifier,
      },
      range: {
        dsIdentifier: "http://www.w3.org/2001/XMLSchema#string",
      },
    }];

    const associations: UiAssociation[] = [{
      displayLabel: "hasFile",
      dsIdentifier: "icfwsrg699dm1ndp4o0",
      iri: "aaa",
      vocabulary: local,
      visualDsIdentifier: null,
      domain: {
        entityDsIdentifier: "gjicauujarm1ndo8v7",
        vocabularyDsIdentifier: local.dsIdentifier,
      },
      range: {
        entityDsIdentifier: "jn7hbn6e3drm1ndoil4",
        vocabularyDsIdentifier: local.dsIdentifier,
      },
    }];

    const associationProfiles: UiAssociationProfile[] = [{
      displayLabel: "Crooked Point",
      dsIdentifier: "qj8evoy2gahm46r8olh",
      iri: "crookedPoint",
      vocabulary: local,
      visualDsIdentifier: null,
      profiles: [{
        profileOf: {
          entityDsIdentifier: "zqjoipz78wm41t042p",
          vocabularyDsIdentifier: "jtnzl",
        }
      }],
      domain: {
        entityDsIdentifier: "e4xe32lyj06m2wbmps4",
        vocabularyDsIdentifier: local.dsIdentifier,
      },
      range: {
        entityDsIdentifier: "gjicauujarm1ndo8v7",
        vocabularyDsIdentifier: local.dsIdentifier,
      },
    }, {
      displayLabel: "hasFiled",
      dsIdentifier: "tm0pr6de2oim398f6hy",
      iri: "aaa",
      vocabulary: local,
      visualDsIdentifier: null,
      profiles: [{
        profileOf: {
          entityDsIdentifier: "icfwsrg699dm1ndp4o0",
          vocabularyDsIdentifier: "8d8xl",
        }
      }],
      domain: {
        entityDsIdentifier: "gjicauujarm1ndo8v7",
        vocabularyDsIdentifier: local.dsIdentifier,
      },
      range: {
        entityDsIdentifier: "jn7hbn6e3drm1ndoil4",
        vocabularyDsIdentifier: local.dsIdentifier,
      },
    }];

    const generalizations: UiGeneralization[] = [{
      dsIdentifier: "8b7m5yz3ml5m1ugvhj5",
      vocabulary: local,
      iri: null,
      visualDsIdentifier: null,
      parent: {
        entityDsIdentifier: "jn7hbn6e3drm1ndoil4",
        vocabularyDsIdentifier: local.dsIdentifier,
        displayLabel: "File",
      },
      child: {
        entityDsIdentifier: "g9kgr30n0km1ugv822",
        vocabularyDsIdentifier: local.dsIdentifier,
        displayLabel: "CSV File",
      },
    }];

    expect(actual.classes).toStrictEqual(classes);

    expect(actual.classProfiles).toStrictEqual(classProfiles);

    expect(actual.attributes).toStrictEqual(attributes);

    expect(actual.attributeProfiles).toStrictEqual(attributeProfiles);

    expect(actual.associations).toStrictEqual(associations);

    expect(actual.associationProfiles).toStrictEqual(associationProfiles);

    expect(actual.generalizations).toStrictEqual(generalizations);

  });

  test("Basic test second model.", () => {

    const actual = entityModelToUiState(
      "#111111", t,
      [secondVocabulary], [localVocabulary, secondVocabulary],
      aggregates, visualModel, ["en"]);

    const second: UiVocabulary = {
      baseIri: null,
      displayColor: "#00f",
      displayLabel: "Second model",
      dsIdentifier: "jtnzl",
      vocabularyType: UiVocabularyType.Default,
    };

    const classes: UiClass[] = [{
      displayLabel: "File",
      dsIdentifier: "9oz2oxw29a9m3k7heco",
      iri: "File",
      vocabulary: second,
      visualDsIdentifier: null,
    }];

    const classProfiles: UiClassProfile[] = [];

    const attributes: UiAttribute[] = [{
      displayLabel: "Repulsive Area",
      dsIdentifier: "quvpe342ram4b5mnrf",
      iri: "RepulsiveArea",
      vocabulary: second,
      visualDsIdentifier: null,
      domain: {
        entityDsIdentifier: "g9kgr30n0km1ugv822",
        vocabularyDsIdentifier: localVocabulary.getId(),
      },
      range: {
        dsIdentifier: "http://www.w3.org/2001/XMLSchema#string",
      },
    }];

    const attributeProfiles: UiAttributeProfile[] = [];

    const associations: UiAssociation[] = [{
      displayLabel: "Crooked Point",
      dsIdentifier: "zqjoipz78wm41t042p",
      iri: "crookedPoint",
      vocabulary: second,
      visualDsIdentifier: "0000",
      domain: {
        entityDsIdentifier: "e4xe32lyj06m2wbmps4",
        vocabularyDsIdentifier: localVocabulary.getId(),
      },
      range: {
        entityDsIdentifier: "gjicauujarm1ndo8v7",
        vocabularyDsIdentifier: localVocabulary.getId(),
      },
    }];

    const associationProfiles: UiAssociationProfile[] = [];

    const generalizations: UiGeneralization[] = [];

    expect(actual.classes).toStrictEqual(classes);

    expect(actual.classProfiles).toStrictEqual(classProfiles);

    expect(actual.attributes).toStrictEqual(attributes);

    expect(actual.attributeProfiles).toStrictEqual(attributeProfiles);

    expect(actual.associations).toStrictEqual(associations);

    expect(actual.associationProfiles).toStrictEqual(associationProfiles);

    expect(actual.generalizations).toStrictEqual(generalizations);

  });

  test("Basic test with profiles without visual.", () => {
    // TODO PeSk Ready for profiles.
    /*
    const thirdVocabularyEntities = {
      "1": {
        id: "1",
        type: [SEMANTIC_MODEL_CLASS_PROFILE],
        iri: ":1",
        name: { "": "name" },
        nameFromProfiled: "2",
        description: { "": "description" },
        descriptionFromProfiled: "2",
        profiling: ["2", "3"],
        usageNote: { "": "note" },
        usageNoteFromProfiled: "3",
      },
      "2": {
        id: "2",
        type: [SEMANTIC_MODEL_CLASS],
        iri: "2",
        name: { "": "name-2" },
        description: { "": "description-2" },
      },
      "3": {
        id: "3",
        type: [SEMANTIC_MODEL_CLASS_PROFILE],
        iri: "",
        name: {"", "name-3"},
        nameFromProfiled: null,
        description: null,
        descriptionFromProfiled: null,
        usageNote: { "": "note-3" },
        usageNoteFromProfiled: null,
        profiling: ["2"],
      },
      "4": {
        id: "4",
        type: [SEMANTIC_MODEL_RELATIONSHIP_PROFILE],
        ends: [{
          iri:"1-1-iri",
          name: null,
          nameFromProfiled: "5",
          description: null,
          descriptionFromProfiled: "5",
          cardinality: null,
          cardinalityFromProfiled: "5",
          concept: null,
          conceptFromProfiled: "5",
          profiling: ["5"],
          usageNote: null,
          usageNoteFromProfiled: "5",
        }, {
          iri:"1-2-iri",
          name: null,
          nameFromProfiled: "6",
          description: null,
          descriptionFromProfiled: "6",
          cardinality: null,
          cardinalityFromProfiled: "6",
          concept: null,
          conceptFromProfiled: "6",
          profiling: ["6"],
          usageNote: null,
          usageNoteFromProfiled: "6",
        }],
      },
      "5": {
        id: "5",
        type: [SEMANTIC_MODEL_RELATIONSHIP],
        ends: [{
          iri:"2-iri",
          name: {"": "2-name"},
          description: {"": "2-description"},
          cardinality: [0, 1],
          concept: "2-concept-1",
          profiling: [],
          usageNote: {"": "2-note"},
        }, {
          iri: null,
          concept: "2-concept-2",
        }]
      },
      "6": {
        id: "6",
        type: [SEMANTIC_MODEL_RELATIONSHIP],
        ends: [{
          iri: null,
          concept: "2-concept-1",
        }, {
          iri:"3-iri",
          name: {"": "3-name"},
          description: {"": "3-description"},
          cardinality: [0, 2],
          concept: "3-concept-2",
          profiling: [],
          usageNote: {"": "3-note"},
        }],
      },
    };

    const thirdVocabulary = new MemoryModel(
      "jtnzl", "Second model", thirdModelEntities);

    const actual = entityModelToUiState(
      "#000000", t,
      [thirdVocabulary], [thirdVocabulary],
      aggregates, null, ["en"]);

    const uiModel = entityModelToUiModel("#000000", t, thirdVocabulary, null);

    const expected: UiModelState = {
      defaultWriteModel: uiModel,
      models: [uiModel],
      visualModel: null,
      classes: [{
        dsIdentifier: "2",
        iri: "2",
        displayLabel: "name-2",
        model: uiModel,
        visualDsIdentifier: null,
      }],
      classProfiles: [{
        dsIdentifier: "1",
        iri: ":1",
        model: uiModel,
        displayLabel: "name-2",
        profiles: [{
          profileOf: { entityDsIdentifier: "2", modelDsIdentifier: "jtnzl" }
        }, {
          profileOf: {entityDsIdentifier: "3", modelDsIdentifier: "jtnzl"}
        }
        ],
        visualDsIdentifier: null,
      }, {
        dsIdentifier: "2",
        iri: "",
        model: uiModel,
        displayLabel: "name-3",
        profiles: [{
          profileOf: { entityDsIdentifier: "2", modelDsIdentifier: "jtnzl" }
        }],
        visualDsIdentifier: null,
      }],
      attributes: [],
      attributeProfiles: [],
      associations: [],
      associationProfiles: [],
      generalizations: [],
    };

    expect(actual).toStrictEqual(expected);
    */
  });

});

describe("semanticModelChangeToUiState", () => {

  const model: UiVocabulary = {
    dsIdentifier: "qckc",
    baseIri: "",
    displayLabel: "",
    displayColor: "#768212",
    vocabularyType: UiVocabularyType.Default,
  };

  const classInstance: SemanticModelClass = {
    id: "class",
    type: [SEMANTIC_MODEL_CLASS],
    iri: ":class",
    name: { "en": "Class" },
    description: {},
  };

  const userInstance: SemanticModelClass = {
    id: "user",
    type: [SEMANTIC_MODEL_CLASS],
    iri: ":user",
    name: { "en": "User" },
    description: {},
  };

  const adminInstance: SemanticModelClass = {
    id: "admin",
    type: [SEMANTIC_MODEL_CLASS],
    iri: ":admin",
    name: { "en": "Admin" },
    description: {},
  };

  test("Add a class.", () => {
    const entities: AggregatedEntityWrapper[] = [{
      id: "class",
      sources: [],
      visualEntity: null,
      rawEntity: classInstance,
      aggregatedEntity: classInstance
    }];
    const removed: string[] = [];
    const models: EntityModel[] = [
      new MemoryModel("qckc", null, {
        [classInstance.id]: classInstance
      })];
    const visualModel: VisualModel = new VisualModelMock(
      {},
      { "class": { identifier: "0000", type: [] } }
    );
    const state: UiModelState = {
      defaultWriteVocabulary: model,
      visualModel: null,
      vocabularies: [model],
      classes: [],
      classProfiles: [],
      attributes: [],
      attributeProfiles: [],
      associations: [],
      associationProfiles: [],
      generalizations: [],
    };
    // Run the operation.
    const actual = semanticModelChangeToUiState(
      entities, removed, models, visualModel, ["en"], state);
    // Expected state.
    const expected: UiModelState = {
      ...state,
      classes: [{
        dsIdentifier: "class",
        vocabulary: model,
        iri: ":class",
        displayLabel: "Class",
        visualDsIdentifier: "0000",
      }],
    }
    // Final check.
    expect(actual).toStrictEqual(expected);
  });

  test("Remove a class.", () => {
    const entities: AggregatedEntityWrapper[] = [];
    const removed: string[] = ["class"];
    const models: EntityModel[] = [];
    const visualModel: VisualModel | null = null;
    const state: UiModelState = {
      defaultWriteVocabulary: model,
      visualModel: null,
      vocabularies: [model],
      classes: [{
        dsIdentifier: "class",
        vocabulary: model,
        iri: ":class",
        displayLabel: "Class",
        visualDsIdentifier: "0000",
      }],
      classProfiles: [],
      attributes: [],
      attributeProfiles: [],
      associations: [],
      associationProfiles: [],
      generalizations: [],
    };
    // Run the operation.
    const actual = semanticModelChangeToUiState(
      entities, removed, models, visualModel, ["en"], state);
    // Expected state.
    const expected: UiModelState = {
      ...state,
      classes: [],
    }
    // Final check.
    expect(actual).toStrictEqual(expected);
  });

  test("Update a class.", () => {
    const entities: AggregatedEntityWrapper[] = [{
      id: "class",
      sources: [],
      visualEntity: null,
      rawEntity: classInstance,
      aggregatedEntity: classInstance
    }];
    const removed: string[] = [];
    const models: EntityModel[] = [
      new MemoryModel("qckc", null, {
        [classInstance.id]: classInstance
      })];
    const visualModel: VisualModel = new VisualModelMock(
      {},
      { "class": { identifier: "0000", type: [] } }
    );
    const state: UiModelState = {
      defaultWriteVocabulary: model,
      visualModel: null,
      vocabularies: [model],
      classes: [{
        dsIdentifier: "class",
        vocabulary: model,
        iri: ":class-old",
        displayLabel: "Class-old",
        visualDsIdentifier: "0000",
      }],
      classProfiles: [],
      attributes: [],
      attributeProfiles: [],
      associations: [],
      associationProfiles: [],
      generalizations: [],
    };
    // Run the operation.
    const actual = semanticModelChangeToUiState(
      entities, removed, models, visualModel, ["en"], state);
    // Expected state.
    const expected: UiModelState = {
      ...state,
      classes: [{
        dsIdentifier: "class",
        vocabulary: model,
        iri: ":class",
        displayLabel: "Class",
        visualDsIdentifier: "0000",
      }],
    }
    // Final check.
    expect(actual).toStrictEqual(expected);
  });

  test("Add a generalization.", () => {
    const generalizationInstance: SemanticModelGeneralization = {
      id: "gen",
      type: [SEMANTIC_MODEL_GENERALIZATION],
      iri: ":gen",
      child: "admin",
      parent: "user",
    };
    const entities: AggregatedEntityWrapper[] = [{
      id: "gen",
      sources: [],
      visualEntity: null,
      rawEntity: generalizationInstance,
      aggregatedEntity: null,
    }];
    const removed: string[] = [];
    const vocabularies: EntityModel[] = [
      new MemoryModel("qckc", null, {
        [userInstance.id]: userInstance,
        [adminInstance.id]: adminInstance,
        [generalizationInstance.id]: generalizationInstance,
      })];
    const visualModel: VisualModel | null = null;
    const state: UiModelState = {
      defaultWriteVocabulary: model,
      visualModel: null,
      vocabularies: [model],
      classes: [{
        dsIdentifier: "admin",
        vocabulary: model,
        iri: ":admin",
        displayLabel: "Admin",
        visualDsIdentifier: null,
      }, {
        dsIdentifier: "user",
        vocabulary: model,
        iri: ":user",
        displayLabel: "User",
        visualDsIdentifier: null,
      }],
      classProfiles: [],
      attributes: [],
      attributeProfiles: [],
      associations: [],
      associationProfiles: [],
      generalizations: [],
    };
    // Run the operation.
    const actual = semanticModelChangeToUiState(
      entities, removed, vocabularies, visualModel, ["en"], state);
    // Expected state.
    const expectedGeneralizations: UiGeneralization[] = [{
      dsIdentifier: "gen",
      vocabulary: model,
      iri: ":gen",
      visualDsIdentifier: null,
      parent: {
        entityDsIdentifier: "user",
        vocabularyDsIdentifier: model.dsIdentifier,
        displayLabel: "User",
      },
      child: {
        entityDsIdentifier: "admin",
        vocabularyDsIdentifier: model.dsIdentifier,
        displayLabel: "Admin",
      },
    }];
    const expected: UiModelState = {
      ...state,
      classes: [
        {
          dsIdentifier: "admin",
          vocabulary: model,
          iri: ":admin",
          displayLabel: "Admin",
          visualDsIdentifier: null,
        },
        state.classes[1]
      ],
      generalizations: expectedGeneralizations,
    }
    // Final check.
    expect(actual).toStrictEqual(expected);
  });

  test("Remove a generalization.", () => {
    const entities: AggregatedEntityWrapper[] = [];
    const removed: string[] = ["gen"];
    const vocabularies: EntityModel[] = [];
    const visualModel: VisualModel | null = null;

    const state: UiModelState = {
      defaultWriteVocabulary: model,
      visualModel: null,
      vocabularies: [model],
      classes: [{
        dsIdentifier: "user",
        vocabulary: model,
        iri: ":user",
        displayLabel: "User",
        visualDsIdentifier: null,
      }, {
        dsIdentifier: "admin",
        vocabulary: model,
        iri: ":admin",
        displayLabel: "Admin",
        visualDsIdentifier: null,
      }],
      classProfiles: [],
      attributes: [],
      attributeProfiles: [],
      associations: [],
      associationProfiles: [],
      generalizations: [{
        dsIdentifier: "gen",
        iri: ":gen",
        vocabulary: model,
        visualDsIdentifier: null,
        parent: {
          entityDsIdentifier: "user",
          vocabularyDsIdentifier: model.dsIdentifier,
          displayLabel: "User",
        },
        child: {
          entityDsIdentifier: "admin",
          vocabularyDsIdentifier: model.dsIdentifier,
          displayLabel: "Admin",
        },
      }],
    };
    // Run the operation.
    const actual = semanticModelChangeToUiState(
      entities, removed, vocabularies, visualModel, ["en"], state);
    // Expected state.
    const expected: UiModelState = {
      ...state,
      classes: [{
        dsIdentifier: "admin",
        vocabulary: model,
        iri: ":admin",
        displayLabel: "Admin",
        visualDsIdentifier: null,
      }, {
        dsIdentifier: "user",
        vocabulary: model,
        iri: ":user",
        displayLabel: "User",
        visualDsIdentifier: null,
      }],
      generalizations: [],
    }
    // Final check.
    expect(actual).toStrictEqual(expected);
  });

  test("Update a generalization.", () => {
    const generalizationInstance: SemanticModelGeneralization = {
      id: "gen",
      type: [SEMANTIC_MODEL_GENERALIZATION],
      iri: ":gen",
      child: "user",
      parent: "admin",
    };
    const entities: AggregatedEntityWrapper[] = [{
      id: "gen",
      sources: [],
      visualEntity: null,
      rawEntity: generalizationInstance,
      aggregatedEntity: null,
    }];
    const removed: string[] = [];
    const vocabularies: EntityModel[] = [
      new MemoryModel("qckc", null, {
        // We entities here so the generalization can reference them.
        [userInstance.id]: userInstance,
        [adminInstance.id]: adminInstance,
        [generalizationInstance.id]: generalizationInstance,
      })];
    const visualModel: VisualModel | null = null;
    const state: UiModelState = {
      defaultWriteVocabulary: model,
      visualModel: null,
      vocabularies: [model],
      classes: [{
        dsIdentifier: "user",
        vocabulary: model,
        iri: ":user",
        displayLabel: "User",
        visualDsIdentifier: null,
      }, {
        dsIdentifier: "admin",
        vocabulary: model,
        iri: ":admin",
        displayLabel: "Admin",
        visualDsIdentifier: null,
      }],
      classProfiles: [],
      attributes: [],
      attributeProfiles: [],
      associations: [],
      associationProfiles: [],
      generalizations: [{
        dsIdentifier: "gen",
        vocabulary: model,
        iri: ":gen",
        visualDsIdentifier: null,
        parent: {
          entityDsIdentifier: "user",
          vocabularyDsIdentifier: model.dsIdentifier,
          displayLabel: "User",
        },
        child: {
          entityDsIdentifier: "admin",
          vocabularyDsIdentifier: model.dsIdentifier,
          displayLabel: "Admin",
        }
      }]
    };
    // Run the operation.
    const actual = semanticModelChangeToUiState(
      entities, removed, vocabularies, visualModel, ["en"], state);
    // Expected state.
    const expected: UiModelState = {
      ...state,
      classes: [{
        dsIdentifier: "admin",
        vocabulary: model,
        iri: ":admin",
        displayLabel: "Admin",
        visualDsIdentifier: null,
      }, {
        dsIdentifier: "user",
        vocabulary: model,
        iri: ":user",
        displayLabel: "User",
        visualDsIdentifier: null,
      }],
      generalizations: [{
        dsIdentifier: "gen",
        vocabulary: model,
        iri: ":gen",
        visualDsIdentifier: null,
        parent: {
          entityDsIdentifier: "admin",
          vocabularyDsIdentifier: model.dsIdentifier,
          displayLabel: "Admin",
        },
        child: {
          entityDsIdentifier: "user",
          vocabularyDsIdentifier: model.dsIdentifier,
          displayLabel: "User",
        }
      }],
    }
    // Final check.
    expect(actual).toStrictEqual(expected);
  });

});

describe("visualModelToUiState", () => {

  test("Set visual model.", () => {
    const vocabulary: UiVocabulary = {
      dsIdentifier: "0",
      displayLabel: "zero",
      baseIri: null,
      displayColor: "#000000",
      vocabularyType: UiVocabularyType.Default,
    };
    const state: UiModelState = {
      ...createEmptyState(),
      vocabularies: [{
        dsIdentifier: "0",
        displayLabel: "zero",
        baseIri: null,
        displayColor: "#000000",
        vocabularyType: UiVocabularyType.Default,
      }],
      visualModel: null,
      classes: [{
        dsIdentifier: "class",
        iri: ":class",
        vocabulary: vocabulary,
        displayLabel: "Class",
        visualDsIdentifier: null,
      }]
    };
    const visual = new VisualModelMock({ "0": "#ff0000" }, {});
    const actual = visualModelToUiState(state, visual, "#aa0000");
    const nextVocabulary: UiVocabulary = {
      ...vocabulary,
      displayColor: "#ff0000",
    };
    const expected: UiModelState = {
      ...actual,
      vocabularies: [nextVocabulary],
      classes: [{
        ...state.classes[0],
        vocabulary: nextVocabulary,
      }]
    };
    //
    expect(actual).toStrictEqual(expected);
  });

  test("Replace visual model.", () => {
    const vocabulary: UiVocabulary = {
      dsIdentifier: "0",
      displayLabel: "zero",
      baseIri: null,
      displayColor: "#000000",
      vocabularyType: UiVocabularyType.Default,
    };
    const visual = new VisualModelMock({ "0": "#000000" }, {});
    const state: UiModelState = {
      ...createEmptyState(),
      vocabularies: [{
        dsIdentifier: "0",
        displayLabel: "zero",
        baseIri: null,
        displayColor: "#000000",
        vocabularyType: UiVocabularyType.Default,
      }],
      visualModel: visual,
      classes: [{
        dsIdentifier: "class",
        iri: ":class",
        vocabulary: vocabulary,
        displayLabel: "Class",
        visualDsIdentifier: null,
      }],
    };
    const nextVisual = new VisualModelMock({ "0": "#ff0000" }, {});
    const actual = visualModelToUiState(state, nextVisual, "#aa0000");
    const nextVocabulary: UiVocabulary = {
      ...vocabulary,
      displayColor: "#ff0000",
    };
    const expected: UiModelState = {
      ...actual,
      vocabularies: [nextVocabulary],
      classes: [{
        ...state.classes[0],
        vocabulary: nextVocabulary,
      }],
      visualModel: nextVisual,
    };
    //
    expect(actual).toStrictEqual(expected);
  });

});

describe("removeVisualModelToUiState", () => {

  test("Default test.", () => {
    const vocabulary: UiVocabulary = {
      dsIdentifier: "0000",
      baseIri: null,
      displayColor: "#010101",
      displayLabel: "",
      vocabularyType: UiVocabularyType.Default,
    };

    const state: UiModelState = {
      defaultWriteVocabulary: vocabulary,
      visualModel: new VisualModelMock({}, {}),
      vocabularies: [vocabulary],
      classes: [{
        dsIdentifier: "user",
        vocabulary: vocabulary,
        iri: ":user",
        displayLabel: "User",
        visualDsIdentifier: null,
      }],
      classProfiles: [],
      attributes: [],
      attributeProfiles: [],
      associations: [],
      associationProfiles: [],
      generalizations: [],
    };

    // Run the operation.
    const actual = removeVisualModelToUiState(state, "#111111");
    // Expected state.
    const nextVocabulary = {
      ...vocabulary,
      displayColor: "#111111",
    };

    const expected: UiModelState = {
      ...state,
      defaultWriteVocabulary: nextVocabulary,
      visualModel: null,
      vocabularies: [nextVocabulary],
      classes: [{
        dsIdentifier: "user",
        vocabulary: nextVocabulary,
        iri: ":user",
        displayLabel: "User",
        visualDsIdentifier: null,
      }],
    };
    // Final check.
    expect(actual).toStrictEqual(expected);

  });

});

