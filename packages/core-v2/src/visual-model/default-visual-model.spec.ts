import { createDefaultEntityModel } from "./entity-model/default-entity-model";
import { MODEL_VISUAL_TYPE, VisualEntity, VisualNode, isVisualNode } from "./visual-entity";
import { WritableVisualModel } from "./visual-model";
import { createDefaultVisualModelFactory } from "./visual-model-factory";

const factory = createDefaultVisualModelFactory();

test("Create default visual model.", () => {
  const identifier = "abc";
  const model = createModel(identifier);
  //
  expect(model.getIdentifier()).toBe(identifier);
});

function createModel(identifier: string) : WritableVisualModel {
  const internal = createDefaultEntityModel(MODEL_VISUAL_TYPE, identifier);
  const model = factory.createWritableVisualModelSync(internal);
  expect(model).not.toBeNull;
  // TypeScript does not infer the not null from previous line.
  return model as WritableVisualModel;
}

test("Set and delete model color.", () => {
  const model = createModel("abc");
  //
  expect(model.getModelColor("1234")).toBeNull();
  model.setModelColor("1234", "#00ff00");
  expect(model.getModelColor("1234")).toBe("#00ff00");
  model.deleteModelColor("1234");
  expect(model.getModelColor("1234")).toBeNull();
});

test("Set and delete visual entity.", () => {
  const model = createModel("abc");
  const numberOfEntitiesInModelAfterInitialization = [...model.getVisualEntities().entries()].length;
  //
  expect(model.getVisualEntitiesForRepresented("s").length).toBe(0);
  model.addVisualNode({
    representedEntity: "s",
    model: "m",
    content: [],
    visualModels: [],
    position: { x: 100, y: 200, anchored: null },
  });
  const actual = model.getVisualEntitiesForRepresented("s");
  expect(actual.length).toBeGreaterThan(0);
  expect(isVisualNode(actual[0] as VisualEntity)).toBeTruthy();
  const visualNode = actual[0] as VisualNode;
  expect(visualNode.representedEntity).toBe("s");
  model.deleteVisualEntity(visualNode.identifier);
  expect(model.getVisualEntitiesForRepresented("s").length).toBe(0);
  expect([...model.getVisualEntities().entries()].length).toBe(numberOfEntitiesInModelAfterInitialization);
});

test("Set and delete visual entity (multi).", () => {
  const model = createModel("abc");
  //
  expect(model.getVisualEntitiesForRepresented("s").length).toBe(0);
  model.addVisualNode({
    representedEntity: "s",
    model: "m",
    content: [],
    visualModels: [],
    position: { x: 100, y: 200, anchored: null },
  });
  model.addVisualNode({
    representedEntity: "s",
    model: "m",
    content: [],
    visualModels: [],
    position: { x: 200, y: 300, anchored: null },
  });
  const actual = model.getVisualEntitiesForRepresented("s");
  expect(actual.length).toBe(2);
  //
  expect(isVisualNode(actual[0] as VisualEntity)).toBeTruthy();
  const visualNode1 = actual[0] as VisualNode;
  expect(visualNode1.representedEntity).toBe("s");
  //
  expect(isVisualNode(actual[1] as VisualEntity)).toBeTruthy();
  const visualNode2 = actual[1] as VisualNode;
  expect(visualNode2.representedEntity).toBe("s");
  //
  model.deleteVisualEntity(visualNode1.identifier);
  expect(model.getVisualEntitiesForRepresented("s").length).toBe(1);
});
