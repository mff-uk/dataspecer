import { Entity, EntityIdentifier } from "../../../entity-model/entity";
import { createDefaultSemanticModelProfileOperationExecutor } from "./operations-executor";
import { createDefaultSemanticModelProfileOperationFactory } from "./operations-factory";
import { SEMANTIC_MODEL_CLASS_PROFILE, SEMANTIC_MODEL_RELATIONSHIP_PROFILE, SemanticModelClassProfile, SemanticModelRelationshipProfile } from "../concepts";

interface ChangeEntry {

  updated: Record<EntityIdentifier, Entity>;

  removed: EntityIdentifier[];
}

const factory = createDefaultSemanticModelProfileOperationFactory();

test("Create class profile.", () => {
  let counter = 0;
  const actual: ChangeEntry[] = [];
  const executor = createDefaultSemanticModelProfileOperationExecutor(
    { createIdentifier: () => (++counter).toString() },
    { entity: () => null },
    { change: (updated, removed) => actual.push({ updated, removed }) },
  );
  //
  const result = executor.executeOperation(factory.createClassProfile({
    iri: "iri",
    name: { "en": "name" },
    nameFromProfiled: "name-source",
    description: { "en": "description" },
    descriptionFromProfiled: "description-source",
    usageNote: { "en": "usage-note" },
    usageNoteFromProfiled: "usage-note-source",
    profiling: ["one", "two"],
  }));
  //
  expect(result).toStrictEqual({ success: true, created: ["1"] });
  expect(actual.length).toBe(1);
  expect(actual[0]).toStrictEqual({
    updated: {
      "1": {
        id: "1",
        type: [SEMANTIC_MODEL_CLASS_PROFILE],
        iri: "iri",
        name: { "en": "name" },
        nameFromProfiled: "name-source",
        description: { "en": "description" },
        descriptionFromProfiled: "description-source",
        usageNote: { "en": "usage-note" },
        usageNoteFromProfiled: "usage-note-source",
        profiling: ["one", "two"],
      }
    },
    removed: []
  });
});

test("Modify class profile, change none.", () => {
  let counter = 0;
  const actual: ChangeEntry[] = [];
  const previous: SemanticModelClassProfile = {
    id: "1",
    type: [SEMANTIC_MODEL_CLASS_PROFILE],
    iri: "iri",
    name: { "en": "name" },
    nameFromProfiled: "name-source",
    description: { "en": "description" },
    descriptionFromProfiled: "description-source",
    usageNote: { "en": "usage-note" },
    usageNoteFromProfiled: "usage-note-source",
    profiling: ["one", "two"],
  };
  const executor = createDefaultSemanticModelProfileOperationExecutor(
    { createIdentifier: () => (++counter).toString() },
    { entity: () => previous },
    { change: (updated, removed) => actual.push({ updated, removed }) },
  );
  //
  const result = executor.executeOperation(factory.modifyClassProfile(
    "1", {}));
  //
  expect(result).toStrictEqual({ success: true, created: [] });
  expect(actual.length).toBe(1);
  expect(actual[0]).toStrictEqual({
    updated: {
      "1": {
        id: "1",
        type: [SEMANTIC_MODEL_CLASS_PROFILE],
        iri: "iri",
        name: { "en": "name" },
        nameFromProfiled: "name-source",
        description: { "en": "description" },
        descriptionFromProfiled: "description-source",
        usageNote: { "en": "usage-note" },
        usageNoteFromProfiled: "usage-note-source",
        profiling: ["one", "two"],
      }
    },
    removed: []
  });
});

test("Modify class profile, change all.", () => {
  let counter = 0;
  const actual: ChangeEntry[] = [];
  const previous: SemanticModelClassProfile = {
    id: "1",
    type: [SEMANTIC_MODEL_CLASS_PROFILE],
    iri: "iri",
    name: { "en": "prev-name" },
    nameFromProfiled: "prev-name-source",
    description: { "en": "prev-description" },
    descriptionFromProfiled: "prev-description-source",
    usageNote: { "en": "prev-usage-note" },
    usageNoteFromProfiled: "prev-usage-note-source",
    profiling: ["prev-one", "prev-two"],
  };
  const executor = createDefaultSemanticModelProfileOperationExecutor(
    { createIdentifier: () => (++counter).toString() },
    { entity: () => previous },
    { change: (updated, removed) => actual.push({ updated, removed }) },
  );
  //
  const result = executor.executeOperation(factory.modifyClassProfile(
    "1", {
    iri: "iri",
    name: { "en": "name" },
    nameFromProfiled: "name-source",
    description: { "en": "description" },
    descriptionFromProfiled: "description-source",
    usageNote: { "en": "usage-note" },
    usageNoteFromProfiled: "usage-note-source",
    profiling: ["one", "two"],
  }));
  //
  expect(result).toStrictEqual({ success: true, created: [] });
  expect(actual.length).toBe(1);
  expect(actual[0]).toStrictEqual({
    updated: {
      "1": {
        id: "1",
        type: [SEMANTIC_MODEL_CLASS_PROFILE],
        iri: "iri",
        name: { "en": "name" },
        nameFromProfiled: "name-source",
        description: { "en": "description" },
        descriptionFromProfiled: "description-source",
        usageNote: { "en": "usage-note" },
        usageNoteFromProfiled: "usage-note-source",
        profiling: ["one", "two"],
      }
    },
    removed: []
  });
});

test("Create relationship profile.", () => {
  let counter = 0;
  const actual: ChangeEntry[] = [];
  const executor = createDefaultSemanticModelProfileOperationExecutor(
    { createIdentifier: () => (++counter).toString() },
    { entity: () => null },
    { change: (updated, removed) => actual.push({ updated, removed }) },
  );
  //
  const result = executor.executeOperation(factory.createRelationshipProfile({
    ends: [{
      iri: "first",
      name: { "en": "first-name" },
      nameFromProfiled: "first-name-source",
      description: { "en": "first-description" },
      descriptionFromProfiled: "first-description-source",
      cardinality: [1, 1],
      cardinalityFromProfiled: "first-cardinality-source",
      concept: "first-concept",
      conceptFromProfiled: "first-concept-source",
      profiling: ["first"],
      usageNote: { "en": "first-note" },
      usageNoteFromProfiled: "first-note-source",
    }, {
      iri: "second",
      name: { "en": "second-name" },
      nameFromProfiled: "second-name-source",
      description: { "en": "second-description" },
      descriptionFromProfiled: "second-description-source",
      cardinality: [1, 1],
      cardinalityFromProfiled: "second-cardinality-source",
      concept: "second-concept",
      conceptFromProfiled: "second-concept-source",
      profiling: ["second"],
      usageNote: { "en": "second-note" },
      usageNoteFromProfiled: "second-note-source",
    }],
  }));
  //
  expect(result).toStrictEqual({ success: true, created: ["1"] });
  expect(actual.length).toBe(1);
  expect(actual[0]).toStrictEqual({
    updated: {
      "1": {
        id: "1",
        type: [SEMANTIC_MODEL_RELATIONSHIP_PROFILE],
        ends: [{
          iri: "first",
          name: { "en": "first-name" },
          nameFromProfiled: "first-name-source",
          description: { "en": "first-description" },
          descriptionFromProfiled: "first-description-source",
          cardinality: [1, 1],
          cardinalityFromProfiled: "first-cardinality-source",
          concept: "first-concept",
          conceptFromProfiled: "first-concept-source",
          profiling: ["first"],
          usageNote: { "en": "first-note" },
          usageNoteFromProfiled: "first-note-source",
        }, {
          iri: "second",
          name: { "en": "second-name" },
          nameFromProfiled: "second-name-source",
          description: { "en": "second-description" },
          descriptionFromProfiled: "second-description-source",
          cardinality: [1, 1],
          cardinalityFromProfiled: "second-cardinality-source",
          concept: "second-concept",
          conceptFromProfiled: "second-concept-source",
          profiling: ["second"],
          usageNote: { "en": "second-note" },
          usageNoteFromProfiled: "second-note-source",
        }],
      }
    },
    removed: []
  });
});

test("Modify relationship profile.", () => {
  let counter = 0;
  const actual: ChangeEntry[] = [];
  const previous: SemanticModelRelationshipProfile = {
    id: "1",
    type: [SEMANTIC_MODEL_RELATIONSHIP_PROFILE],
    ends: [{
      iri: "first",
      name: null,
      nameFromProfiled: null,
      description: null,
      descriptionFromProfiled: null,
      cardinality: null,
      cardinalityFromProfiled: null,
      concept: null,
      conceptFromProfiled: null,
      profiling: [],
      usageNote: null,
      usageNoteFromProfiled: null,
    }, {
      iri: "second",
      name: null,
      nameFromProfiled: null,
      description: null,
      descriptionFromProfiled: null,
      cardinality: null,
      cardinalityFromProfiled: null,
      concept: null,
      conceptFromProfiled: null,
      profiling: [],
      usageNote: null,
      usageNoteFromProfiled: null,
    }],
  };
  const executor = createDefaultSemanticModelProfileOperationExecutor(
    { createIdentifier: () => (++counter).toString() },
    { entity: () => previous },
    { change: (updated, removed) => actual.push({ updated, removed }) },
  );
  //
  const result = executor.executeOperation(factory.modifyRelationshipProfile(
    "1", {
    ends: [{
      iri: "first",
      name: { "en": "first-name" },
      nameFromProfiled: "first-name-source",
      description: { "en": "first-description" },
      descriptionFromProfiled: "first-description-source",
      cardinality: [1, 1],
      cardinalityFromProfiled: "first-cardinality-source",
      concept: "first-concept",
      conceptFromProfiled: "first-concept-source",
      profiling: ["first"],
      usageNote: { "en": "first-note" },
      usageNoteFromProfiled: "first-note-source",
    }, {
      iri: "second",
      name: { "en": "second-name" },
      nameFromProfiled: "second-name-source",
      description: { "en": "second-description" },
      descriptionFromProfiled: "second-description-source",
      cardinality: [1, 1],
      cardinalityFromProfiled: "second-cardinality-source",
      concept: "second-concept",
      conceptFromProfiled: "second-concept-source",
      profiling: ["second"],
      usageNote: { "en": "second-note" },
      usageNoteFromProfiled: "second-note-source",
    }],
  }));
  //
  expect(result).toStrictEqual({ success: true, created: [] });
  expect(actual.length).toBe(1);
  expect(actual[0]).toStrictEqual({
    updated: {
      "1": {
        id: "1",
        type: [SEMANTIC_MODEL_RELATIONSHIP_PROFILE],
        ends: [{
          iri: "first",
          name: { "en": "first-name" },
          nameFromProfiled: "first-name-source",
          description: { "en": "first-description" },
          descriptionFromProfiled: "first-description-source",
          cardinality: [1, 1],
          cardinalityFromProfiled: "first-cardinality-source",
          concept: "first-concept",
          conceptFromProfiled: "first-concept-source",
          profiling: ["first"],
          usageNote: { "en": "first-note" },
          usageNoteFromProfiled: "first-note-source",
        }, {
          iri: "second",
          name: { "en": "second-name" },
          nameFromProfiled: "second-name-source",
          description: { "en": "second-description" },
          descriptionFromProfiled: "second-description-source",
          cardinality: [1, 1],
          cardinalityFromProfiled: "second-cardinality-source",
          concept: "second-concept",
          conceptFromProfiled: "second-concept-source",
          profiling: ["second"],
          usageNote: { "en": "second-note" },
          usageNoteFromProfiled: "second-note-source",
        }],
      }
    },
    removed: []
  });
});

test("Relationship ignores additional edges.", () => {
  let counter = 0;
  const actual: ChangeEntry[] = [];
  const executor = createDefaultSemanticModelProfileOperationExecutor(
    { createIdentifier: () => (++counter).toString() },
    { entity: () => null },
    { change: (updated, removed) => actual.push({ updated, removed }) },
  );
  //
  const result = executor.executeOperation(factory.createRelationshipProfile({
    ends: [{
      iri: "first",
      name: null,
      nameFromProfiled: null,
      description: null,
      descriptionFromProfiled: null,
      cardinality: null,
      cardinalityFromProfiled: null,
      concept: null,
      conceptFromProfiled: null,
      profiling: [],
      usageNote: null,
      usageNoteFromProfiled: null,
    }, {
      iri: "second",
      name: null,
      nameFromProfiled: null,
      description: null,
      descriptionFromProfiled: null,
      cardinality: null,
      cardinalityFromProfiled: null,
      concept: null,
      conceptFromProfiled: null,
      profiling: [],
      usageNote: null,
      usageNoteFromProfiled: null,
    }, {
      iri: "third",
      name: null,
      nameFromProfiled: null,
      description: null,
      descriptionFromProfiled: null,
      cardinality: null,
      cardinalityFromProfiled: null,
      concept: null,
      conceptFromProfiled: null,
      profiling: [],
      usageNote: null,
      usageNoteFromProfiled: null,
    }],
  }));
  //
  expect(result).toStrictEqual({ success: true, created: ["1"] });
  expect(actual.length).toBe(1);
  expect(actual[0]).toStrictEqual({
    updated: {
      "1": {
        id: "1",
        type: [SEMANTIC_MODEL_RELATIONSHIP_PROFILE],
        ends: [{
          iri: "first",
          name: null,
          nameFromProfiled: null,
          description: null,
          descriptionFromProfiled: null,
          cardinality: null,
          cardinalityFromProfiled: null,
          concept: null,
          conceptFromProfiled: null,
          profiling: [],
          usageNote: null,
          usageNoteFromProfiled: null,
        }, {
          iri: "second",
          name: null,
          nameFromProfiled: null,
          description: null,
          descriptionFromProfiled: null,
          cardinality: null,
          cardinalityFromProfiled: null,
          concept: null,
          conceptFromProfiled: null,
          profiling: [],
          usageNote: null,
          usageNoteFromProfiled: null,
        }],
      }
    },
    removed: []
  });
});
