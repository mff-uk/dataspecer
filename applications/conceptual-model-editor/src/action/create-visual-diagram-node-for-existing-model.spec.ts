/**
 * Tests:
 * {@link addVisualDiagramNodeForExistingModelToVisualModelAction}
 */

import { expect, test } from "vitest";
import { createDefaultVisualModelFactory, isVisualDiagramNode, VisualDiagramNode, WritableVisualModel } from "@dataspecer/core-v2/visual-model";

import { notificationMockup } from "./test/actions-test-suite";
import { ActionsTestSuite } from "./test/actions-test-suite";
import { addVisualDiagramNodeForExistingModelToVisualModelAction } from "./create-visual-diagram-node-for-existing-model";

test("Test addVisualDiagramNodeForExistingModelToVisualModelAction", () => {
  const {
    visualModel,
    model,
    graph
  } = ActionsTestSuite.prepareModelsWithSemanticData(0);
  const diagram = ActionsTestSuite.createTestDiagram();

  // Prepare data
  const referencedVisualModel: WritableVisualModel = createDefaultVisualModelFactory().createNewWritableVisualModelSync();
  ActionsTestSuite.createNewVisualNodeForTesting(referencedVisualModel, model.getId(), "2");
  ActionsTestSuite.createNewVisualNodeForTesting(referencedVisualModel, model.getId(), "3");
  graph.aggregator.addModel(referencedVisualModel);

  // Perform action
  addVisualDiagramNodeForExistingModelToVisualModelAction(
    notificationMockup, graph, diagram, visualModel, {}, {}, referencedVisualModel.getIdentifier());

  // Check results
  expect([...visualModel.getVisualEntities().keys()].length).toBe(1);
  const visualDiagramNode = [...visualModel.getVisualEntities().values()][0];
  expect(isVisualDiagramNode(visualDiagramNode)).toBeTruthy();
  expect((visualDiagramNode as VisualDiagramNode).representedVisualModel).toBe(referencedVisualModel.getIdentifier());

});
