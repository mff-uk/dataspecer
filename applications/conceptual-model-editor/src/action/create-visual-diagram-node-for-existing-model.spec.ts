/**
 * Tests:
 * {@link addVisualDiagramNodeForExistingModelToVisualModelAction}
 */

import { expect, test } from "vitest";
import {
  createDefaultVisualModelFactory,
  isVisualDiagramNode,
  VisualDiagramNode,
} from "@dataspecer/core-v2/visual-model";

import { notificationMockup, TestedSemanticConnectionType } from "./test/actions-test-suite";
import { ActionsTestSuite } from "./test/actions-test-suite";
import {
  addVisualDiagramNodeForExistingModelToVisualModelAction
} from "./create-visual-diagram-node-for-existing-model";

test("Test creating visual diagram node from existing visual model", () => {
  const {
    visualModel,
    model,
    graph
  } = ActionsTestSuite.prepareModelsWithSemanticData(0, TestedSemanticConnectionType.Association);
  const diagram = ActionsTestSuite.createTestDiagram();

  // Prepare data
  const referencedVisualModel = createDefaultVisualModelFactory().createNewWritableVisualModelSync();
  ActionsTestSuite.createNewVisualNodeForTesting(referencedVisualModel, model.getId(), "2");
  ActionsTestSuite.createNewVisualNodeForTesting(referencedVisualModel, model.getId(), "3");
  graph.aggregator.addModel(referencedVisualModel);

  // Perform action
  addVisualDiagramNodeForExistingModelToVisualModelAction(
    notificationMockup, graph, diagram, visualModel, referencedVisualModel.getIdentifier());

  // Check results
  expect([...visualModel.getVisualEntities().keys()].length).toBe(1);
  const visualDiagramNode = [...visualModel.getVisualEntities().values()][0];
  expect(isVisualDiagramNode(visualDiagramNode)).toBeTruthy();
  expect((visualDiagramNode as VisualDiagramNode).representedVisualModel)
    .toBe(referencedVisualModel.getIdentifier());
});
