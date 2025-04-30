/**
 * Tests {@link addEntitiesFromSemanticModelToVisualModelAction}
 */

import { expect, test } from "vitest";
import { SemanticModelAggregator, SemanticModelAggregatorView } from "@dataspecer/core-v2/semantic-model/aggregator";
import { createDefaultVisualModelFactory, isVisualNode, isVisualRelationship, VisualNode, WritableVisualModel } from "@dataspecer/core-v2/visual-model";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { Entity, EntityModel } from "@dataspecer/core-v2";
import { ModelGraphContextType } from "../../context/model-context";
import { SetStateAction } from "react";
import { createClass, CreatedEntityOperationResult, createGeneralization, createRelationship } from "@dataspecer/core-v2/semantic-model/operations";
import { XY } from "@dataspecer/layout";
import { DiagramActions, DiagramCallbacks, Edge, EdgeType, Group, GroupWithContent, Node, NodeType, Position, ViewportDimensions } from "../../diagram";
import { ClassesContextType } from "../../context/classes-context";
import { addEntitiesFromSemanticModelToVisualModelAction } from "../add-entities-from-semantic-model-to-visual-model";
import { isSemanticModelClass, isSemanticModelRelationship, SemanticModelClass, SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { UseDiagramType } from "../../diagram/diagram-hook";
import { ActionsTestExportedTypesAndEnums, ActionsTestSuite, notificationMockup } from "./actions-test-suite";

test("Test adding semantic model to visual model - graph with no relationships", async () => {
  const {
    classesContext,
    graph,
    models,
    visualModel,
  } = ActionsTestSuite.prepareModelsWithSemanticData(0, ActionsTestExportedTypesAndEnums.TestedSemanticConnectionType.Association);
  const diagram = ActionsTestSuite.createTestDiagram();
  const relevantModel = [...models.entries()][0][1];
  await addEntitiesFromSemanticModelToVisualModelAction(
    notificationMockup, classesContext, graph,
    diagram, visualModel, relevantModel);

  const result = [...visualModel.getVisualEntities().entries()].map(entity => entity[1]);
  expect(result.length).toBe(4);
  expect(result.filter(isVisualNode).length).toBe(4);
  const expectedRepresentedIds = Object.values(relevantModel.getEntities()).map(entity => entity.id).sort();
  expect((result as VisualNode[]).map(node => node.representedEntity).sort()).toEqual(expectedRepresentedIds);
});

test("Test adding semantic model to visual model - square graph", async () => {
  const {
    classesContext,
    graph,
    models,
    visualModel,
  } = ActionsTestSuite.prepareModelsWithSemanticData(0, ActionsTestExportedTypesAndEnums.TestedSemanticConnectionType.Association);
  const diagram = ActionsTestSuite.createTestDiagram();
  const relevantModel = [...models.entries()][1][1];
  await addEntitiesFromSemanticModelToVisualModelAction(
    notificationMockup, classesContext, graph,
    diagram, visualModel, relevantModel);

  const result = [...visualModel.getVisualEntities().entries()].map(entity => entity[1]);
  const nodes = result.filter(isVisualNode);
  const edges = result.filter(isVisualRelationship);
  expect(result.length).toBe(8);  // 4 nodes + 4 edges
  expect(nodes.length).toBe(4);
  expect(edges.length).toBe(4);
  const expectedRepresentedNodeIds = Object.values(relevantModel.getEntities()).filter(isSemanticModelClass).map(entity => entity.id).sort();
  expect(nodes.map(node => node.representedEntity).sort()).toEqual(expectedRepresentedNodeIds);
  const expectedRelationshipRepresentedIds = Object.values(relevantModel.getEntities()).filter(isSemanticModelRelationship).map(entity => entity.id).sort();
  expect(edges.map(edge => edge.representedRelationship).sort()).toEqual(expectedRelationshipRepresentedIds);
});

test("Test adding semantic model to visual model - fully connected graph", async () => {
  const {
    classesContext,
    graph,
    models,
    visualModel,
  } = ActionsTestSuite.prepareModelsWithSemanticData(0, ActionsTestExportedTypesAndEnums.TestedSemanticConnectionType.Association);
  const diagram = ActionsTestSuite.createTestDiagram();
  const relevantModel = [...models.entries()][2][1];
  await addEntitiesFromSemanticModelToVisualModelAction(
    notificationMockup, classesContext, graph,
    diagram, visualModel, relevantModel);

    const result = [...visualModel.getVisualEntities().entries()].map(entity => entity[1]);
  const nodes = result.filter(isVisualNode);
  const edges = result.filter(isVisualRelationship);
  expect(result.length).toBe(10);  // 4 nodes + 6 edges
  expect(nodes.length).toBe(4);
  expect(edges.length).toBe(6);
  const expectedRepresentedNodeIds = Object.values(relevantModel.getEntities()).filter(isSemanticModelClass).map(entity => entity.id).sort();
  expect(nodes.map(node => node.representedEntity).sort()).toEqual(expectedRepresentedNodeIds);
  const expectedRelationshipRepresentedIds = Object.values(relevantModel.getEntities()).filter(isSemanticModelRelationship).map(entity => entity.id).sort();
  expect(edges.map(edge => edge.representedRelationship).sort()).toEqual(expectedRelationshipRepresentedIds);
});
