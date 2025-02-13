import { expect, test } from "vitest";
import { EntityModel } from "@dataspecer/core-v2";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { createDefaultVisualModelFactory, WritableVisualModel } from "@dataspecer/core-v2/visual-model";
import { ClassesContextType } from "../context/classes-context";
import { entityModelsMapToCmeVocabulary } from "../dataspecer/semantic-model/semantic-model-adapter";
import { noActionNotificationServiceWriter } from "../notification/notification-service-context";
import { CreatedEntityOperationResult, createGeneralization, createRelationship } from "@dataspecer/core-v2/semantic-model/operations";
import { Specialization } from "../dialog/utilities/dialog-utilities";
import { addSemanticRelationshipToVisualModelAction } from "./add-relationship-to-visual-model";
import { ModelGraphContextType } from "../context/model-context";
import { SemanticModelAggregator, SemanticModelAggregatorView } from "@dataspecer/core-v2/semantic-model/aggregator";
import { SetStateAction } from "react";
import { createNodeDuplicateAction } from "./create-node-duplicate";

test("Create single relationship", () => {
  const {
    visualModel,
    models,
    model,
    cmeModels,
    graph
  } = prepareModelWithFourNodes();

  const createdRelationships: {
    identifier: string,
    model: InMemorySemanticModel
  }[] = [];
  //
  createdRelationships.push(createSemanticRelationshipTestVariant(
    graph, models, "0", "1", cmeModels[0].dsIdentifier, "relationship-0"));
  expect(visualModel.getVisualEntitiesForRepresented(createdRelationships[0].identifier)).toEqual(null);
  expect([...visualModel.getVisualEntities().entries()].length).toBe(4);
  //
  addSemanticRelationshipToVisualModelAction(noActionNotificationServiceWriter, graph, visualModel, createdRelationships[0].identifier, cmeModels[0].dsIdentifier);
  expect([...visualModel.getVisualEntities().entries()].length).toBe(5);
  expect(visualModel.getVisualEntitiesForRepresented(createdRelationships[0].identifier)).to.not.toBeNull();
  expect(visualModel.getVisualEntitiesForRepresented(createdRelationships[0].identifier)?.length).toBe(1);
  //
  createNodeDuplicateAction(noActionNotificationServiceWriter, visualModel, visualModel.getVisualEntitiesForRepresented("0")![0].identifier);
  expect([...visualModel.getVisualEntities().entries()].length).toBe(7);
  expect(visualModel.getVisualEntitiesForRepresented(createdRelationships[0].identifier)).to.not.toBeNull();
  expect(visualModel.getVisualEntitiesForRepresented(createdRelationships[0].identifier)?.length).toBe(2);
  expect(visualModel.getVisualEntitiesForRepresented("0")?.length).toBe(2);
});

test("Create single relationship", () => {
  const {
    visualModel,
    models,
    model,
    cmeModels,
    graph
  } = prepareModelWithFourNodes();

  const createdRelationships: {
    identifier: string,
    model: InMemorySemanticModel
  }[] = [];
  //
  createdRelationships.push(createSemanticRelationshipTestVariant(
    graph, models, "0", "1", cmeModels[0].dsIdentifier, "relationship-0"));
  expect(visualModel.getVisualEntitiesForRepresented(createdRelationships[0].identifier)).toEqual(null);
  expect([...visualModel.getVisualEntities().entries()].length).toBe(4);
  //
  addSemanticRelationshipToVisualModelAction(noActionNotificationServiceWriter, graph, visualModel, createdRelationships[0].identifier, cmeModels[0].dsIdentifier);
  expect([...visualModel.getVisualEntities().entries()].length).toBe(5);
  expect(visualModel.getVisualEntitiesForRepresented(createdRelationships[0].identifier)).to.not.toBeNull();
  expect(visualModel.getVisualEntitiesForRepresented(createdRelationships[0].identifier)?.length).toBe(1);
  //
  createNodeDuplicateAction(noActionNotificationServiceWriter, visualModel, visualModel.getVisualEntitiesForRepresented("0")![0].identifier);
  expect([...visualModel.getVisualEntities().entries()].length).toBe(7);
  expect(visualModel.getVisualEntitiesForRepresented(createdRelationships[0].identifier)).to.not.toBeNull();
  expect(visualModel.getVisualEntitiesForRepresented(createdRelationships[0].identifier)?.length).toBe(2);
  expect(visualModel.getVisualEntitiesForRepresented("0")?.length).toBe(2);
});

test("Create single relationship", () => {
  const {
    visualModel,
    models,
    model,
    cmeModels,
    graph
  } = prepareModelWithFourNodes();

  const createdRelationships: {
    identifier: string,
    model: InMemorySemanticModel
  }[] = [];
  //
  createdRelationships.push(createSemanticRelationshipTestVariant(
    graph, models, "0", "1", cmeModels[0].dsIdentifier, "relationship-0"));
  expect(visualModel.getVisualEntitiesForRepresented(createdRelationships[0].identifier)).toEqual(null);
  expect([...visualModel.getVisualEntities().entries()].length).toBe(4);
  //
  addSemanticRelationshipToVisualModelAction(noActionNotificationServiceWriter, graph, visualModel, createdRelationships[0].identifier, cmeModels[0].dsIdentifier);
  expect([...visualModel.getVisualEntities().entries()].length).toBe(5);
  expect(visualModel.getVisualEntitiesForRepresented(createdRelationships[0].identifier)).to.not.toBeNull();
  expect(visualModel.getVisualEntitiesForRepresented(createdRelationships[0].identifier)?.length).toBe(1);
});

test("Create relationship then after that duplicate node", () => {
  const {
    visualModel,
    models,
    model,
    cmeModels,
    graph
  } = prepareModelWithFourNodes();

  const createdRelationships: {
    identifier: string,
    model: InMemorySemanticModel
  }[] = [];
  //
  createdRelationships.push(createSemanticRelationshipTestVariant(
    graph, models, "0", "1", cmeModels[0].dsIdentifier, "relationship-0"));
  expect(visualModel.getVisualEntitiesForRepresented(createdRelationships[0].identifier)).toEqual(null);
  expect([...visualModel.getVisualEntities().entries()].length).toBe(4);
  //
  addSemanticRelationshipToVisualModelAction(noActionNotificationServiceWriter, graph, visualModel, createdRelationships[0].identifier, cmeModels[0].dsIdentifier);
  expect([...visualModel.getVisualEntities().entries()].length).toBe(5);
  expect(visualModel.getVisualEntitiesForRepresented(createdRelationships[0].identifier)?.length).toBe(1);
  //
  createNodeDuplicateAction(noActionNotificationServiceWriter, visualModel, visualModel.getVisualEntitiesForRepresented("0")![0].identifier);
  expect([...visualModel.getVisualEntities().entries()].length).toBe(7);
  expect(visualModel.getVisualEntitiesForRepresented(createdRelationships[0].identifier)?.length).toBe(2);
  expect(visualModel.getVisualEntitiesForRepresented("0")?.length).toBe(2);
});



test("Create node duplicate and after that create relationship from the original node", () => {
  const {
    visualModel,
    models,
    model,
    cmeModels,
    graph
  } = prepareModelWithFourNodes();

  const createdRelationships: {
    identifier: string,
    model: InMemorySemanticModel
  }[] = [];
  //
  createdRelationships.push(createSemanticRelationshipTestVariant(
    graph, models, "0", "1", cmeModels[0].dsIdentifier, "relationship-0"));
  expect(visualModel.getVisualEntitiesForRepresented(createdRelationships[0].identifier)).toEqual(null);
  expect([...visualModel.getVisualEntities().entries()].length).toBe(4);
  //
  createNodeDuplicateAction(noActionNotificationServiceWriter, visualModel, visualModel.getVisualEntitiesForRepresented("0")![0].identifier);
  expect([...visualModel.getVisualEntities().entries()].length).toBe(5);
  expect(visualModel.getVisualEntitiesForRepresented("0")?.length).toBe(2);
  expect(visualModel.getVisualEntitiesForRepresented(createdRelationships[0].identifier)).toBeNull();
  //
  addSemanticRelationshipToVisualModelAction(noActionNotificationServiceWriter, graph, visualModel, createdRelationships[0].identifier, cmeModels[0].dsIdentifier);
  expect([...visualModel.getVisualEntities().entries()].length).toBe(6);
  expect(visualModel.getVisualEntitiesForRepresented(createdRelationships[0].identifier)?.length).toBe(1);
});


test("Create self loop relationship and after that create duplicate of that node", () => {
  const {
    visualModel,
    models,
    model,
    cmeModels,
    graph
  } = prepareModelWithFourNodes();

  const createdRelationships: {
    identifier: string,
    model: InMemorySemanticModel
  }[] = [];
  //
  createdRelationships.push(createSemanticRelationshipTestVariant(
    graph, models, "0", "0", cmeModels[0].dsIdentifier, "relationship-0"));
  expect(visualModel.getVisualEntitiesForRepresented(createdRelationships[0].identifier)).toEqual(null);
  expect([...visualModel.getVisualEntities().entries()].length).toBe(4);
  //
  addSemanticRelationshipToVisualModelAction(noActionNotificationServiceWriter, graph, visualModel, createdRelationships[0].identifier, cmeModels[0].dsIdentifier);
  expect([...visualModel.getVisualEntities().entries()].length).toBe(5);
  expect(visualModel.getVisualEntitiesForRepresented(createdRelationships[0].identifier)?.length).toBe(1);
  //
  createNodeDuplicateAction(noActionNotificationServiceWriter, visualModel, visualModel.getVisualEntitiesForRepresented("0")![0].identifier);
  expect([...visualModel.getVisualEntities().entries()].length).toBe(8);
  expect(visualModel.getVisualEntitiesForRepresented("0")?.length).toBe(2);
  expect(visualModel.getVisualEntitiesForRepresented(createdRelationships[0].identifier)?.length).toBe(3);
  //
});


test("Create node duplicate and after that create relationship from the original node to the duplicate", () => {
  const {
    visualModel,
    models,
    model,
    cmeModels,
    graph
  } = prepareModelWithFourNodes();

  const createdRelationships: {
    identifier: string,
    model: InMemorySemanticModel
  }[] = [];
  //
  createdRelationships.push(createSemanticRelationshipTestVariant(
    graph, models, "0", "0", cmeModels[0].dsIdentifier, "relationship-0"));
  expect(visualModel.getVisualEntitiesForRepresented(createdRelationships[0].identifier)).toEqual(null);
  expect([...visualModel.getVisualEntities().entries()].length).toBe(4);
  //
  createNodeDuplicateAction(noActionNotificationServiceWriter, visualModel, visualModel.getVisualEntitiesForRepresented("0")![0].identifier);
  expect([...visualModel.getVisualEntities().entries()].length).toBe(5);
  expect(visualModel.getVisualEntitiesForRepresented("0")?.length).toBe(2);
  expect(visualModel.getVisualEntitiesForRepresented(createdRelationships[0].identifier)).toBeNull();
  //
  addSemanticRelationshipToVisualModelAction(noActionNotificationServiceWriter, graph, visualModel, createdRelationships[0].identifier, cmeModels[0].dsIdentifier);
  expect([...visualModel.getVisualEntities().entries()].length).toBe(6);
  expect(visualModel.getVisualEntitiesForRepresented(createdRelationships[0].identifier)?.length).toBe(1);
});


//

const generateIriForName = (name: string) => {
  return name + "-iri.cz";
}

const prepareModelWithFourNodes = () => {
  const visualModel: WritableVisualModel = createDefaultVisualModelFactory().createNewWritableVisualModelSync();
  const modelIdentifier = "TEST-MODEL";
  const modelAlias = "TEST MODEL";

  const visualIdentifiers = [];
  for(let i = 0; i < 4; i++) {
    const visualIdentifier = createNewVisualNodeForTesting(visualModel, modelIdentifier, i);
    visualIdentifiers.push(visualIdentifier);
  }

  const models : Map<string, EntityModel> = new Map();
  const model = new InMemorySemanticModel();
  model.setAlias(modelAlias);
  models.set(model.getId(), model);

  const cmeModels = entityModelsMapToCmeVocabulary(models, visualModel);

  //
  const aggregator = new SemanticModelAggregator();
  aggregator.addModel(model);
  aggregator.addModel(visualModel);
  const aggregatorView = aggregator.getView();
  const visualModels: Map<string, WritableVisualModel> = new Map(Object.entries({[visualModel.getIdentifier()]: visualModel}));

  const graph: ModelGraphContextType = {
    aggregator,
    aggregatorView,
    setAggregatorView: function (value: SetStateAction<SemanticModelAggregatorView>): void {
      throw new Error("Function not implemented.");
    },
    models: models,
    setModels: function (value: SetStateAction<Map<string, EntityModel>>): void {
      throw new Error("Function not implemented.");
    },
    visualModels,
    setVisualModels: function (value: SetStateAction<Map<string, WritableVisualModel>>): void {
      throw new Error("Function not implemented.");
    }
  };

  return {
    visualModel,
    modelIdentifier,
    modelAlias,
    visualIdentifiers,
    models,
    model,
    cmeModels,
    graph,
  };
}

const createEmptyClassesContextType = (): ClassesContextType => {
  const classes: ClassesContextType = {
    classes: [],
    allowedClasses: [],
    setAllowedClasses: function (_) { },
    relationships: [],
    generalizations: [],
    usages: [],
    sourceModelOfEntityMap: new Map(),
    rawEntities: [],
    classProfiles: [],
    relationshipProfiles: []
  };

  return classes;
};

const createNewVisualNodeForTesting = (visualModel: WritableVisualModel, model: string, semanticIdentifierAsNumber: number) => {
  const visualId = visualModel.addVisualNode({
    representedEntity: semanticIdentifierAsNumber.toString(),
    model,
    content: [],
    visualModels: [],
    position: { x: semanticIdentifierAsNumber, y: 0, anchored: null },
  });

  return visualId;
}


// Heavily inspired by createSemanticAssociationInternal
// We are doing this so:
// 1) We don't have create the state for the method
// 2) It is less work
function createSemanticRelationshipTestVariant(
  graph: ModelGraphContextType,
  models: Map<string, EntityModel>,
  domainConceptIdentifier: string,
  rangeConceptIdentifier: string,
  modelDsIdentifier: string,
  relationshipName: string,
): {
  identifier: string,
  model: InMemorySemanticModel
} {
  const name = {"en": relationshipName};

  const operation = createRelationship({
    ends: [{
      iri: null,
      name: {},
      description: {},
      concept: domainConceptIdentifier,
      cardinality: [0, 1],
    }, {
      name,
      description: {},
      concept: rangeConceptIdentifier,
      cardinality: [0, 1],
      iri: generateIriForName(name["en"]),
    }]
  });

  const model: InMemorySemanticModel = models.get(modelDsIdentifier) as InMemorySemanticModel;
  const newAssociation = model.executeOperation(operation) as CreatedEntityOperationResult;

  // Perform additional modifications for which we need to have the class identifier.
  const operations = [];
  const specializations: Specialization[] = [];
  for (const specialization of specializations) {
    operations.push(createGeneralization({
      parent: specialization.specialized,
      child: newAssociation.id,
      iri: specialization.iri,
    }));
  }
  model.executeOperations(operations);

  return {
    identifier: newAssociation.id,
    model,
  };
}
