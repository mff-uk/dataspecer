/**
 * Tests {@link removeFromVisualModelByRepresentedAction} and interaction with {@link createVisualEdgeEndpointDuplicateAction}.
 */

import { expect, test } from "vitest";
import { notificationMockup, TestedSemanticConnectionType } from "./test/actions-test-suite";
import { createVisualEdgeEndpointDuplicateAction } from "./create-visual-edge-endpoint-duplicate";
import { ActionsTestSuite } from "./test/actions-test-suite";
import { removeFromVisualModelByRepresentedAction } from "./remove-from-visual-model-by-represented";

test("removeFromVisualModelAction - relationship", () => {
  const {
    visualModel,
    model,
    graph,
    classesContext
  } = ActionsTestSuite.prepareModelsWithSemanticData(4, TestedSemanticConnectionType.Association);

  const visualRelationship = ActionsTestSuite.createNewVisualRelationshipsForTestingFromSemanticEnds(
    visualModel, model.getId(), "0", "1", "relationshipSemanticIdentifier");
  expect(visualModel.getVisualEntity(visualRelationship)).not.toBeNull();
  //
  removeFromVisualModelByRepresentedAction(
    notificationMockup, graph, classesContext, visualModel, ["relationshipSemanticIdentifier"]);
  expect(visualModel.getVisualEntity(visualRelationship)).toBeNull();
  expect(visualModel.getVisualEntitiesForRepresented("0").length).toBe(1);
  expect(visualModel.getVisualEntitiesForRepresented("1").length).toBe(1);
  expect(visualModel.getVisualEntitiesForRepresented("2").length).toBe(1);
  expect(visualModel.getVisualEntitiesForRepresented("3").length).toBe(1);
});

test("Remove relationship end - semantic id", () => {
  const {
    visualModel,
    model,
    graph,
    classesContext
  } = ActionsTestSuite.prepareModelsWithSemanticData(4, TestedSemanticConnectionType.Association);

  const nodeToRemove = visualModel.getVisualEntitiesForRepresented("0")[0];
  const visualRelationship = ActionsTestSuite.createNewVisualRelationshipsForTestingFromSemanticEnds(
    visualModel, model.getId(), "0", "1");
  expect(visualModel.getVisualEntity(visualRelationship)).not.toBeNull();
  //
  removeFromVisualModelByRepresentedAction(
    notificationMockup, graph, classesContext, visualModel, ["0"]);
  expect(visualModel.getVisualEntity(visualRelationship)).toBeNull();
  expect(visualModel.getVisualEntitiesForRepresented("0").length).toBe(0);
  expect(visualModel.getVisualEntity(nodeToRemove.identifier)).toBeNull();
  expect(visualModel.getVisualEntitiesForRepresented("1").length).toBe(1);
  expect(visualModel.getVisualEntitiesForRepresented("2").length).toBe(1);
  expect(visualModel.getVisualEntitiesForRepresented("3").length).toBe(1);
});

test("Remove relationship ends at the same time", () => {
  const {
    visualModel,
    model,
    graph,
    classesContext
  } = ActionsTestSuite.prepareModelsWithSemanticData(4, TestedSemanticConnectionType.Association);

  const sourceNodeToRemove = visualModel.getVisualEntitiesForRepresented("0")[0];
  const targetNodeToRemove = visualModel.getVisualEntitiesForRepresented("1")[0];
  const visualRelationship = ActionsTestSuite.createNewVisualRelationshipsForTestingFromSemanticEnds(
    visualModel, model.getId(), "0", "1");
  expect(visualModel.getVisualEntity(visualRelationship)).not.toBeNull();
  //
  removeFromVisualModelByRepresentedAction(
    notificationMockup, graph, classesContext, visualModel, ["0", "1"]);
  expect(visualModel.getVisualEntity(visualRelationship)).toBeNull();
  expect(visualModel.getVisualEntitiesForRepresented("0").length).toBe(0);
  expect(visualModel.getVisualEntity(sourceNodeToRemove.identifier)).toBeNull();
  expect(visualModel.getVisualEntity(targetNodeToRemove.identifier)).toBeNull();
  expect(visualModel.getVisualEntitiesForRepresented("1").length).toBe(0);
  expect(visualModel.getVisualEntitiesForRepresented("2").length).toBe(1);
  expect(visualModel.getVisualEntitiesForRepresented("3").length).toBe(1);
});

test("Remove ends and the relationship", () => {
  const {
    visualModel,
    model,
    graph,
    classesContext
  } = ActionsTestSuite.prepareModelsWithSemanticData(4, TestedSemanticConnectionType.Association);

  const sourceNodeToRemove = visualModel.getVisualEntitiesForRepresented("0")[0];
  const targetNodeToRemove = visualModel.getVisualEntitiesForRepresented("1")[0];
  const visualRelationship = ActionsTestSuite.createNewVisualRelationshipsForTestingFromSemanticEnds(
    visualModel, model.getId(), "0", "1", "relationshipId");
  expect(visualModel.getVisualEntity(visualRelationship)).not.toBeNull();
  expect(visualModel.getVisualEntitiesForRepresented("relationshipId").length).toBe(1);
  removeFromVisualModelByRepresentedAction(
    notificationMockup, graph, classesContext, visualModel, ["0", "1", "relationshipId"]);
  expect(visualModel.getVisualEntity(visualRelationship)).toBeNull();
  expect(visualModel.getVisualEntitiesForRepresented("relationshipId").length).toBe(0);
  expect(visualModel.getVisualEntitiesForRepresented("0").length).toBe(0);
  expect(visualModel.getVisualEntity(sourceNodeToRemove.identifier)).toBeNull();
  expect(visualModel.getVisualEntity(targetNodeToRemove.identifier)).toBeNull();
  expect(visualModel.getVisualEntitiesForRepresented("1").length).toBe(0);
  expect(visualModel.getVisualEntitiesForRepresented("2").length).toBe(1);
  expect(visualModel.getVisualEntitiesForRepresented("3").length).toBe(1);
});

test("Remove end of many edges", () => {
  const {
    visualModel,
    model,
    graph,
    classesContext
  } = ActionsTestSuite.prepareModelsWithSemanticData(4, TestedSemanticConnectionType.Association);

  ActionsTestSuite.createNewVisualRelationshipsForTestingFromSemanticEnds(
    visualModel, model.getId(), "0", "1", "relationshipId1");
  ActionsTestSuite.createNewVisualRelationshipsForTestingFromSemanticEnds(
    visualModel, model.getId(), "1", "2", "relationshipId2");
  expect(visualModel.getVisualEntitiesForRepresented("relationshipId1").length).toBe(1);
  expect(visualModel.getVisualEntitiesForRepresented("relationshipId2").length).toBe(1);
  //
  removeFromVisualModelByRepresentedAction(
    notificationMockup, graph, classesContext, visualModel, ["1"]);
  expect(visualModel.getVisualEntitiesForRepresented("relationshipId1").length).toBe(0);
  expect(visualModel.getVisualEntitiesForRepresented("relationshipId2").length).toBe(0);
  expect(visualModel.getVisualEntitiesForRepresented("0").length).toBe(1);
  expect(visualModel.getVisualEntitiesForRepresented("1").length).toBe(0);
  expect(visualModel.getVisualEntitiesForRepresented("2").length).toBe(1);
  expect(visualModel.getVisualEntitiesForRepresented("3").length).toBe(1);
});

test("Remove node duplicate", () => {
  const {
    visualModel,
    model,
    graph,
    classesContext
  } = ActionsTestSuite.prepareModelsWithSemanticData(4, TestedSemanticConnectionType.Association);
  const diagram = ActionsTestSuite.createTestDiagram();

  ActionsTestSuite.createNewVisualRelationshipsForTestingFromSemanticEnds(
    visualModel, model.getId(), "0", "1", "relationshipId");
  const nodeToDuplicate = visualModel.getVisualEntitiesForRepresented("0")[0];
  createVisualEdgeEndpointDuplicateAction(notificationMockup, diagram, visualModel, nodeToDuplicate.identifier);
  expect(visualModel.getVisualEntitiesForRepresented("relationshipId").length).toBe(2);
  expect(visualModel.getVisualEntitiesForRepresented("0").length).toBe(2);
  //
  removeFromVisualModelByRepresentedAction(
    notificationMockup, graph, classesContext, visualModel, ["0"]);
  expect(visualModel.getVisualEntitiesForRepresented("relationshipId").length).toBe(0);
  expect(visualModel.getVisualEntitiesForRepresented("0").length).toBe(0);
  expect(visualModel.getVisualEntitiesForRepresented("1").length).toBe(1);
  expect(visualModel.getVisualEntitiesForRepresented("2").length).toBe(1);
  expect(visualModel.getVisualEntitiesForRepresented("3").length).toBe(1);
});