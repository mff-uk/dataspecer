/**
 * Tests addSemanticRelationshipToVisualModelAction and its interaction with createNodeDuplicateAction.
 */

import { expect, test } from "vitest";
import { EntityModel } from "@dataspecer/core-v2";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { createDefaultVisualModelFactory, VisualRelationship, WritableVisualModel } from "@dataspecer/core-v2/visual-model";
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
    cmeModels,
    graph
  } = prepareVisualModelWithFourNodes();

  const createdTestRelationships: {
    identifier: string,
    model: InMemorySemanticModel
  }[] = [];
  //
  createdTestRelationships.push(createSemanticRelationshipTestVariant(
    graph, models, "0", "1", cmeModels[0].dsIdentifier, "relationship-0"));
  addSemanticRelationshipToVisualModelAction(
    noActionNotificationServiceWriter, graph, visualModel,
    createdTestRelationships[0].identifier, cmeModels[0].dsIdentifier, null, null);
  expect([...visualModel.getVisualEntities().entries()].length).toBe(5);
  expect(visualModel.getVisualEntitiesForRepresented(createdTestRelationships[0].identifier)).to.not.toBeNull();
  expect(visualModel.getVisualEntitiesForRepresented(createdTestRelationships[0].identifier)?.length).toBe(1);
});

test("Create relationship then after that duplicate node", () => {
  const {
    visualModel,
    models,
    cmeModels,
    graph
  } = prepareVisualModelWithFourNodes();

  const createdTestRelationships: {
    identifier: string,
    model: InMemorySemanticModel
  }[] = [];
  //
  createdTestRelationships.push(createSemanticRelationshipTestVariant(
    graph, models, "0", "1", cmeModels[0].dsIdentifier, "relationship-0"));
  addSemanticRelationshipToVisualModelAction(noActionNotificationServiceWriter, graph, visualModel,
    createdTestRelationships[0].identifier, cmeModels[0].dsIdentifier, null, null);
  expect([...visualModel.getVisualEntities().entries()].length).toBe(5);
  expect(visualModel.getVisualEntitiesForRepresented(createdTestRelationships[0].identifier)?.length).toBe(1);
  //
  createNodeDuplicateAction(
    noActionNotificationServiceWriter, visualModel,
    visualModel.getVisualEntitiesForRepresented("0")![0].identifier);
  expect([...visualModel.getVisualEntities().entries()].length).toBe(7);
  expect(visualModel.getVisualEntitiesForRepresented(createdTestRelationships[0].identifier)?.length).toBe(2);
  expect(visualModel.getVisualEntitiesForRepresented("0")?.length).toBe(2);
});

test("Create node duplicate and after that create relationship from the original node", () => {
  const {
    visualModel,
    models,
    cmeModels,
    graph
  } = prepareVisualModelWithFourNodes();

  const createdTestRelationships: {
    identifier: string,
    model: InMemorySemanticModel
  }[] = [];
  //
  createdTestRelationships.push(createSemanticRelationshipTestVariant(
    graph, models, "0", "1", cmeModels[0].dsIdentifier, "relationship-0"));
  createNodeDuplicateAction(
    noActionNotificationServiceWriter, visualModel,
    visualModel.getVisualEntitiesForRepresented("0")![0].identifier);
  expect([...visualModel.getVisualEntities().entries()].length).toBe(5);
  expect(visualModel.getVisualEntitiesForRepresented("0")?.length).toBe(2);
  expect(visualModel.getVisualEntitiesForRepresented(createdTestRelationships[0].identifier)).toBeNull();
  //
  const visualSource = visualModel.getVisualEntitiesForRepresented("0")![0];
  const visualTarget = visualModel.getVisualEntitiesForRepresented("1")![0];
  addSemanticRelationshipToVisualModelAction(
    noActionNotificationServiceWriter, graph, visualModel,
    createdTestRelationships[0].identifier, cmeModels[0].dsIdentifier,
    [visualSource.identifier], [visualTarget.identifier]);
  expect([...visualModel.getVisualEntities().entries()].length).toBe(6);
  expect(visualModel.getVisualEntitiesForRepresented(createdTestRelationships[0].identifier)?.length).toBe(1);
  const relationship = visualModel
    .getVisualEntitiesForRepresented(createdTestRelationships[0].identifier)![0] as VisualRelationship;
  expect(relationship.visualSource).toBe(visualSource.identifier);
  expect(relationship.visualTarget).toBe(visualTarget.identifier);
});

test("Create node duplicate and after that create relationship from the original node without specifying visual ends - it should create all the edges", () => {
  const {
    visualModel,
    models,
    cmeModels,
    graph
  } = prepareVisualModelWithFourNodes();

  const createdTestRelationships: {
    identifier: string,
    model: InMemorySemanticModel
  }[] = [];
  //
  createdTestRelationships.push(createSemanticRelationshipTestVariant(
    graph, models, "0", "1", cmeModels[0].dsIdentifier, "relationship-0"));
  createNodeDuplicateAction(
    noActionNotificationServiceWriter, visualModel,
    visualModel.getVisualEntitiesForRepresented("0")![0].identifier);
  expect([...visualModel.getVisualEntities().entries()].length).toBe(5);
  expect(visualModel.getVisualEntitiesForRepresented("0")?.length).toBe(2);
  expect(visualModel.getVisualEntitiesForRepresented(createdTestRelationships[0].identifier)).toBeNull();
  //
  const visualSource1 = visualModel.getVisualEntitiesForRepresented("0")![0];
  const visualSource2 = visualModel.getVisualEntitiesForRepresented("0")![1];
  const visualTarget = visualModel.getVisualEntitiesForRepresented("1")![0];
  addSemanticRelationshipToVisualModelAction(
    noActionNotificationServiceWriter, graph, visualModel,
    createdTestRelationships[0].identifier, cmeModels[0].dsIdentifier,
    null, null);
  expect([...visualModel.getVisualEntities().entries()].length).toBe(7);
  expect(visualModel.getVisualEntitiesForRepresented(createdTestRelationships[0].identifier)?.length).toBe(2);
  //
  const relationships = visualModel.getVisualEntitiesForRepresented(createdTestRelationships[0].identifier);
  const createdVisualRelationships = relationships?.map(relationship => {
    const visualRelationship = relationship as VisualRelationship;
    return {
      visualSource: visualRelationship.visualSource,
      visualTarget: visualRelationship.visualTarget,
    }
  });
  const expectedRelationships = [
    {
      visualSource: visualSource1.identifier,
      visualTarget: visualTarget.identifier,
    },
    {
      visualSource: visualSource2.identifier,
      visualTarget: visualTarget.identifier,
    },
  ]
  expect(createdVisualRelationships).toEqual(expectedRelationships);
});

test("Create self loop relationship and after that create duplicate of that node", () => {
  const {
    visualModel,
    models,
    cmeModels,
    graph
  } = prepareVisualModelWithFourNodes();

  const createdTestRelationships: {
    identifier: string,
    model: InMemorySemanticModel
  }[] = [];
  //
  createdTestRelationships.push(createSemanticRelationshipTestVariant(
    graph, models, "0", "0", cmeModels[0].dsIdentifier, "relationship-0"));
  addSemanticRelationshipToVisualModelAction(
    noActionNotificationServiceWriter, graph, visualModel,
    createdTestRelationships[0].identifier, cmeModels[0].dsIdentifier, null, null);
  expect([...visualModel.getVisualEntities().entries()].length).toBe(5);
  expect(visualModel.getVisualEntitiesForRepresented(createdTestRelationships[0].identifier)?.length).toBe(1);
  //
  createNodeDuplicateAction(noActionNotificationServiceWriter, visualModel, visualModel.getVisualEntitiesForRepresented("0")![0].identifier);
  expect([...visualModel.getVisualEntities().entries()].length).toBe(8);
  expect(visualModel.getVisualEntitiesForRepresented("0")?.length).toBe(2);
  expect(visualModel.getVisualEntitiesForRepresented(createdTestRelationships[0].identifier)?.length).toBe(3);
  //
});

test("Create node duplicate and after that create relationship from the original node to the duplicate", () => {
  const {
    visualModel,
    models,
    cmeModels,
    graph
  } = prepareVisualModelWithFourNodes();

  const createdTestRelationships: {
    identifier: string,
    model: InMemorySemanticModel
  }[] = [];
  //
  createdTestRelationships.push(createSemanticRelationshipTestVariant(
    graph, models, "0", "0", cmeModels[0].dsIdentifier, "relationship-0"));
  createNodeDuplicateAction(
    noActionNotificationServiceWriter, visualModel,
    visualModel.getVisualEntitiesForRepresented("0")![0].identifier);
  expect([...visualModel.getVisualEntities().entries()].length).toBe(5);
  expect(visualModel.getVisualEntitiesForRepresented("0")?.length).toBe(2);
  expect(visualModel.getVisualEntitiesForRepresented(createdTestRelationships[0].identifier)).toBeNull();
  //
  const visualSource = visualModel.getVisualEntitiesForRepresented("0")![0];
  const visualTarget = visualModel.getVisualEntitiesForRepresented("0")![1];
  addSemanticRelationshipToVisualModelAction(
    noActionNotificationServiceWriter, graph, visualModel,
    createdTestRelationships[0].identifier, cmeModels[0].dsIdentifier,
    [visualSource.identifier], [visualTarget.identifier]);
  expect([...visualModel.getVisualEntities().entries()].length).toBe(6);
  expect(visualModel.getVisualEntitiesForRepresented(createdTestRelationships[0].identifier)?.length).toBe(1);
});

//
// Test setup methods
//

const generateIriForName = (name: string) => {
  return name + "-iri.cz";
}

const prepareVisualModelWithFourNodes = () => {
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
    setAggregatorView: function (_value: SetStateAction<SemanticModelAggregatorView>): void {
      throw new Error("Function not implemented.");
    },
    models: models,
    setModels: function (_value: SetStateAction<Map<string, EntityModel>>): void {
      throw new Error("Function not implemented.");
    },
    visualModels,
    setVisualModels: function (_value: SetStateAction<Map<string, WritableVisualModel>>): void {
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
