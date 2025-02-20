import { SEMANTIC_MODEL_CLASS } from "../../concepts";
import { SEMANTIC_MODEL_CLASS_PROFILE, SEMANTIC_MODEL_RELATIONSHIP_PROFILE, SemanticModelClassProfile } from "../concepts";
import { AggregatedProfiledSemanticModelClass, createDefaultProfileEntityAggregator } from "./aggregator";

test("Aggregate class with no profiles.", () => {
  const aggregator = createDefaultProfileEntityAggregator();
  const profile: AggregatedProfiledSemanticModelClass = {
    id: "1",
    type: [SEMANTIC_MODEL_CLASS_PROFILE],
    iri: ":1",
    name: {"":"name"},
    nameFromProfiled: null,
    description: {"":"description"},
    descriptionFromProfiled: null,
    profiling: [],
    usageNote: {"": "note"},
    usageNoteFromProfiled: null,
    conceptIris: [],
  };
  const actual = aggregator.aggregateSemanticModelClassProfile(profile, [])
  expect(actual).toStrictEqual(actual);
});

test("Aggregate class with multiple profiles.", () => {
  const aggregator = createDefaultProfileEntityAggregator();
  const actual = aggregator.aggregateSemanticModelClassProfile({
    id: "1",
    type: [SEMANTIC_MODEL_CLASS_PROFILE],
    iri: ":1",
    name: {"":"name"},
    nameFromProfiled: "2",
    description: {"":"description"},
    descriptionFromProfiled: "2",
    profiling: ["2", "3"],
    usageNote: {"": "note"},
    usageNoteFromProfiled: "3",
  }, [{
    id: "2",
    type: [SEMANTIC_MODEL_CLASS],
    iri: "",
    name: {"": "name-2"},
    description: {"": "description-2"},
  }, {
    id: "3",
    type: [SEMANTIC_MODEL_CLASS_PROFILE],
    iri: "",
    name: null,
    nameFromProfiled: null,
    description: null,
    descriptionFromProfiled: null,
    usageNote: {"": "note-3"},
    usageNoteFromProfiled: null,
    profiling: [],
  }])
  expect(actual).toStrictEqual({
    id: "1",
    type: [SEMANTIC_MODEL_CLASS_PROFILE],
    iri: ":1",
    name: {"":"name-2"},
    nameFromProfiled: "2",
    description: {"":"description-2"},
    descriptionFromProfiled: "2",
    profiling: ["2", "3"],
    usageNote: {"": "note-3"},
    usageNoteFromProfiled: "3",
    conceptIris: [],
  });
});

test("Aggregate relationship with a profiles.", () => {
  const aggregator = createDefaultProfileEntityAggregator();
  const actual = aggregator.aggregateSemanticModelRelationshipProfile({
    id: "1",
    type: [SEMANTIC_MODEL_RELATIONSHIP_PROFILE],
    ends: [{
      iri:"1-1-iri",
      name: null,
      nameFromProfiled: "2",
      description: null,
      descriptionFromProfiled: "2",
      cardinality: null,
      concept: "1-1-concept",
      profiling: ["2", "4"],
      usageNote: null,
      usageNoteFromProfiled: "2",
    }, {
      iri:"1-2-iri",
      name: null,
      nameFromProfiled: "3",
      description: null,
      descriptionFromProfiled: "3",
      cardinality: null,
      concept: "1-2-concept",
      profiling: ["3"],
      usageNote: null,
      usageNoteFromProfiled: "3",
    }],
  }, [{
    id: "2",
    type: [SEMANTIC_MODEL_RELATIONSHIP_PROFILE],
    // The second end is not used.
    ends: [{
      iri:"2-iri",
      name: {"": "2-name"},
      nameFromProfiled: null,
      description: {"": "2-description"},
      descriptionFromProfiled: null,
      cardinality: [0, null],
      concept: "2-concept",
      conceptFromProfiled: null,
      profiling: [],
      usageNote: {"": "2-note"},
      usageNoteFromProfiled: null,
    }]
  }, {
    id: "3",
    type: [SEMANTIC_MODEL_RELATIONSHIP_PROFILE],
    // The first end is not used.
    ends: [null as any, {
      iri:"3-iri",
      name: {"": "3-name"},
      nameFromProfiled: null,
      description: {"": "3-description"},
      descriptionFromProfiled: null,
      cardinality: [0, 2],
      concept: "3-concept",
      profiling: [],
      usageNote: {"": "3-note"},
      usageNoteFromProfiled: null,
    }],
  }, {
    id: "4",
    type: [SEMANTIC_MODEL_RELATIONSHIP_PROFILE],
    // The second end is not used.
    ends: [{
      iri:"4-iri",
      name: {"": "4-name"},
      nameFromProfiled: null,
      description: {"": "4-description"},
      descriptionFromProfiled: null,
      cardinality: [1, 2],
      concept: "4-concept",
      profiling: [],
      usageNote: {"": "4-note"},
      usageNoteFromProfiled: null,
    }],
  }])
  expect(actual).toStrictEqual({
    id: "1",
    type: [SEMANTIC_MODEL_RELATIONSHIP_PROFILE],
    ends: [{
      iri:"1-1-iri",
      name: {"": "2-name"},
      nameFromProfiled: "2",
      description: {"": "2-description"},
      descriptionFromProfiled: "2",
      cardinality: [1, 2],
      concept: "1-1-concept",
      profiling: ["2", "4"],
      usageNote: {"": "2-note"},
      usageNoteFromProfiled: "2",
      conceptIris: [],
    }, {
      iri:"1-2-iri",
      name: {"": "3-name"},
      nameFromProfiled: "3",
      description: {"": "3-description"},
      descriptionFromProfiled: "3",
      cardinality: [0, 2],
      concept: "1-2-concept",
      profiling: ["3"],
      usageNote: {"": "3-note"},
      usageNoteFromProfiled: "3",
      conceptIris: [],
    }],
  });
});
