import { expect, test } from "vitest";
import { noActionNotificationServiceWriter } from "../../notification/notification-service-context";
import { createDefaultVisualModelFactory, VisualNode, WritableVisualModel } from "@dataspecer/core-v2/visual-model";
import { EntityModel } from "@dataspecer/core-v2";
import { entityModelsMapToCmeVocabulary } from "../../dataspecer/semantic-model/semantic-model-adapter";
import { CreatedEntityOperationResult, createRelationship } from "@dataspecer/core-v2/semantic-model/operations";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { addSemanticAttributeToVisualModelAction } from "../add-semantic-attribute-to-visual-model";
import { setAttributePositionAction } from "../set-attribute-position";
import { removeAttributesFromVisualModelAction } from "../remove-attribute-from-visual-model";
import { ClassesContextType } from "../../context/classes-context";
import { SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { representRdfsLiteral } from "../../dialog/utilities/dialog-utilities";
import { createRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/operations";

test("Test change attribute - Visibility", () => {
  const {
    visualModel,
    models,
    model,
    cmeModels
  } = prepareVisualModelWithFourNodes();
  const newAttributes = [];
  //
  newAttributes.push(createSemanticAttributeTestVariant(models, "0", cmeModels[0].dsIdentifier, "attribute-0"));
  addSemanticAttributeToVisualModelAction(noActionNotificationServiceWriter, visualModel, "0", newAttributes[0].identifier, null);
  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content.length).toEqual(1);
  //
  newAttributes.push(createSemanticAttributeTestVariant(models, "0", cmeModels[0].dsIdentifier, "attribute-1"));
  addSemanticAttributeToVisualModelAction(noActionNotificationServiceWriter, visualModel, "0", newAttributes[1].identifier, null);
  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content.length).toEqual(2);
  //
  const classes = createEmptyClassesContextType();
  const attributeAsEntity = Object.values(model.getEntities())[0] as SemanticModelRelationship;
  classes.relationships.push(attributeAsEntity);
  removeAttributesFromVisualModelAction(noActionNotificationServiceWriter, classes, visualModel, [newAttributes[0].identifier]);
  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content.length).toEqual(1);
  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content[0]).toEqual(newAttributes[1].identifier);
});

test("Test change attribute - Visibility - order", () => {
  const {
    visualModel,
    models,
    cmeModels
  } = prepareVisualModelWithFourNodes();
  const newAttributes = [];
  //
  newAttributes.push(createSemanticAttributeTestVariant(models, "0", cmeModels[0].dsIdentifier, "attribute-0"));
  addSemanticAttributeToVisualModelAction(noActionNotificationServiceWriter, visualModel, "0", newAttributes[0].identifier, 0);
  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content.length).toEqual(1);
  //
  newAttributes.push(createSemanticAttributeTestVariant(models, "0", cmeModels[0].dsIdentifier, "attribute-1"));
  addSemanticAttributeToVisualModelAction(noActionNotificationServiceWriter, visualModel, "0", newAttributes[1].identifier, 0);
  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content.length).toEqual(2);
  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content[0]).toEqual(newAttributes[1].identifier);
  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content[1]).toEqual(newAttributes[0].identifier);
  //
  newAttributes.push(createSemanticAttributeTestVariant(models, "0", cmeModels[0].dsIdentifier, "attribute-3"));
  addSemanticAttributeToVisualModelAction(noActionNotificationServiceWriter, visualModel, "0", newAttributes[2].identifier, 1);
  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content.length).toEqual(3);

  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content[0]).toEqual(newAttributes[1].identifier);
  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content[1]).toEqual(newAttributes[2].identifier);
  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content[2]).toEqual(newAttributes[0].identifier);
});

test("Test change attribute - Visibility - back to back", () => {
  const {
    visualModel,
    models,
    model,
    cmeModels
  } = prepareVisualModelWithFourNodes();
  const newAttributes = [];
  //
  newAttributes.push(createSemanticAttributeTestVariant(models, "0", cmeModels[0].dsIdentifier, "attribute-0"));
  addSemanticAttributeToVisualModelAction(noActionNotificationServiceWriter, visualModel, "0", newAttributes[0].identifier, null);
  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content.length).toEqual(1);
  //
  newAttributes.push(createSemanticAttributeTestVariant(models, "0", cmeModels[0].dsIdentifier, "attribute-1"));
  addSemanticAttributeToVisualModelAction(noActionNotificationServiceWriter, visualModel, "0", newAttributes[1].identifier, null);
  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content.length).toEqual(2);

  //
  const classes = createEmptyClassesContextType();
  const attributeAsEntity = Object.values(model.getEntities())[0] as SemanticModelRelationship;
  classes.relationships.push(attributeAsEntity);
  removeAttributesFromVisualModelAction(noActionNotificationServiceWriter, classes, visualModel, [newAttributes[0].identifier]);
  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content.length).toEqual(1);
  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content[0]).toEqual(newAttributes[1].identifier);
  //
  addSemanticAttributeToVisualModelAction(noActionNotificationServiceWriter, visualModel, "0", newAttributes[0].identifier, null);
  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content.length).toEqual(2);
  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content[0]).toEqual(newAttributes[1].identifier);
  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content[1]).toEqual(newAttributes[0].identifier);
});

//

test("Test change attribute usage - Visibility - back to back", () => {
  const {
    visualModel,
    models,
    model,
    cmeModels
  } = prepareVisualModelWithFourNodes();
  const newAttributes = [];
  newAttributes.push(createSemanticAttributeTestVariant(models, "0", cmeModels[0].dsIdentifier, "attribute-0"));
  addSemanticAttributeToVisualModelAction(noActionNotificationServiceWriter, visualModel, "0", newAttributes[0].identifier, null);
  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content.length).toEqual(1);
  //
  newAttributes.push(createSemanticAttributeUsageTestVariant(models, newAttributes[0].identifier, "0", cmeModels[0].dsIdentifier, "attribute-1"));
  addSemanticAttributeToVisualModelAction(noActionNotificationServiceWriter, visualModel, "0", newAttributes[1].identifier, null);
  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content.length).toEqual(2);

  const classes = createEmptyClassesContextType();

  const attributeAsEntity = Object.values(model.getEntities())[0] as SemanticModelRelationship;
  classes.relationships.push(attributeAsEntity);
  removeAttributesFromVisualModelAction(noActionNotificationServiceWriter, classes, visualModel, [newAttributes[0].identifier]);
  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content.length).toEqual(1);
  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content[0]).toEqual(newAttributes[1].identifier);

  addSemanticAttributeToVisualModelAction(noActionNotificationServiceWriter, visualModel, "0", newAttributes[0].identifier, null);
  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content.length).toEqual(2);
  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content[0]).toEqual(newAttributes[1].identifier);
  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content[1]).toEqual(newAttributes[0].identifier);
});

//

test("Test change attribute order - one", () => {
  const {
    visualModel,
    models,
    cmeModels
  } = prepareVisualModelWithFourNodes();
  const size = 5;
  const attributes: string[] = [];
  for(let i = 0; i < size; i++) {
    const newAttribute = createSemanticAttributeTestVariant(models, "0", cmeModels[0].dsIdentifier, `attribute-${i}`);
    addSemanticAttributeToVisualModelAction(noActionNotificationServiceWriter, visualModel, "0", newAttribute.identifier, null);
    attributes.push(newAttribute.identifier);
  }
  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content).toEqual(attributes);
  setAttributePositionAction(
    noActionNotificationServiceWriter,
    visualModel,
    visualModel.getVisualEntitiesForRepresented("0")![0]!.identifier,
    attributes[2],
    4,
  );

  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content[0]).toBe(attributes[0]);
  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content[1]).toBe(attributes[1]);
  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content[2]).toBe(attributes[3]);
  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content[3]).toBe(attributes[4]);
  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content[4]).toBe(attributes[2]);
});

test("Test change attribute order - one - test 2", () => {
  const {
    visualModel,
    models,
    cmeModels
  } = prepareVisualModelWithFourNodes();
  const size = 6;
  const attributes: string[] = [];
  for(let i = 0; i < size; i++) {
    const newAttribute = createSemanticAttributeTestVariant(models, "0", cmeModels[0].dsIdentifier, `attribute-${i}`);
    addSemanticAttributeToVisualModelAction(noActionNotificationServiceWriter, visualModel, "0", newAttribute.identifier, null);
    attributes.push(newAttribute.identifier);
  }
  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content.length).toEqual(size);
  for(let i = 0; i < size; i++) {
    expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content[i]).toBe(attributes[i]);
  }

  setAttributePositionAction(
    noActionNotificationServiceWriter,
    visualModel,
    visualModel.getVisualEntitiesForRepresented("0")![0]!.identifier,
    attributes[4],
    2,
  );

  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content[0]).toBe(attributes[0]);
  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content[1]).toBe(attributes[1]);
  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content[2]).toBe(attributes[4]);
  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content[3]).toBe(attributes[2]);
  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content[4]).toBe(attributes[3]);
  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content[5]).toBe(attributes[5]);
});

test("Test change attribute order - back to back", () => {
  const {
    visualModel,
    models,
    cmeModels
  } = prepareVisualModelWithFourNodes();
  const size = 5;
  const attributes: string[] = [];
  //
  for(let i = 0; i < size; i++) {
    const newAttribute = createSemanticAttributeTestVariant(models, "0", cmeModels[0].dsIdentifier, `attribute-${i}`);
    addSemanticAttributeToVisualModelAction(noActionNotificationServiceWriter, visualModel, "0", newAttribute.identifier, null);
    attributes.push(newAttribute.identifier);
  }
  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content).toEqual(attributes);
  //
  setAttributePositionAction(
    noActionNotificationServiceWriter,
    visualModel,
    visualModel.getVisualEntitiesForRepresented("0")![0]!.identifier,
    attributes[2],
    4,
  );

  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content[0]).toBe(attributes[0]);
  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content[1]).toBe(attributes[1]);
  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content[2]).toBe(attributes[3]);
  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content[3]).toBe(attributes[4]);
  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content[4]).toBe(attributes[2]);

  // Now back
  setAttributePositionAction(
    noActionNotificationServiceWriter,
    visualModel,
  visualModel.getVisualEntitiesForRepresented("0")![0]!.identifier,
  attributes[2],
  2);

  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content[0]).toBe(attributes[0]);
  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content[1]).toBe(attributes[1]);
  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content[2]).toBe(attributes[2]);
  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content[3]).toBe(attributes[3]);
  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content[4]).toBe(attributes[4]);
});

test("Test change attribute order - change multi", () => {
  const {
    visualModel,
    models,
    cmeModels
  } = prepareVisualModelWithFourNodes();
  const size = 6;
  const attributes: string[] = [];
  //
  for(let i = 0; i < size; i++) {
    const newAttribute = createSemanticAttributeTestVariant(models, "0", cmeModels[0].dsIdentifier, `attribute-${i}`);
    addSemanticAttributeToVisualModelAction(noActionNotificationServiceWriter, visualModel, "0", newAttribute.identifier, null);
    attributes.push(newAttribute.identifier);
  }
  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content).toEqual(attributes);
  //
  setAttributePositionAction(
    noActionNotificationServiceWriter,
    visualModel,
    visualModel.getVisualEntitiesForRepresented("0")![0]!.identifier,
    attributes[2],
    4,
  );

  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content[0]).toBe(attributes[0]);
  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content[1]).toBe(attributes[1]);
  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content[2]).toBe(attributes[3]);
  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content[3]).toBe(attributes[4]);
  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content[4]).toBe(attributes[2]);
  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content[5]).toBe(attributes[5]);
  //
  setAttributePositionAction(
    noActionNotificationServiceWriter,
    visualModel,
  visualModel.getVisualEntitiesForRepresented("0")![0]!.identifier,
  attributes[5],
  1);

  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content[0]).toBe(attributes[0]);
  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content[1]).toBe(attributes[5]);
  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content[2]).toBe(attributes[1]);
  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content[3]).toBe(attributes[3]);
  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content[4]).toBe(attributes[4]);
  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content[5]).toBe(attributes[2]);
});

test("Test change attribute order - change multi - attribute usage", () => {
  const {
    visualModel,
    models,
    cmeModels
  } = prepareVisualModelWithFourNodes();
  const size = 6;
  const attributes: string[] = [];
  //
  const originalAttribute = createSemanticAttributeTestVariant(models, "0", cmeModels[0].dsIdentifier, "attribute-0");
  addSemanticAttributeToVisualModelAction(noActionNotificationServiceWriter, visualModel, "0", originalAttribute.identifier, null);
  attributes.push(originalAttribute.identifier);
  for(let i = 1; i < size; i++) {
    const newAttributeUsage = createSemanticAttributeUsageTestVariant(models, originalAttribute.identifier, "0", cmeModels[0].dsIdentifier, `attribute-${i}`);
    addSemanticAttributeToVisualModelAction(noActionNotificationServiceWriter, visualModel, "0", newAttributeUsage.identifier, null);
    attributes.push(newAttributeUsage.identifier);
  }
  //
  setAttributePositionAction(
    noActionNotificationServiceWriter,
    visualModel,
    visualModel.getVisualEntitiesForRepresented("0")![0]!.identifier,
    attributes[2],
    4,
  );

  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content[0]).toBe(attributes[0]);
  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content[1]).toBe(attributes[1]);
  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content[2]).toBe(attributes[3]);
  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content[3]).toBe(attributes[4]);
  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content[4]).toBe(attributes[2]);
  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content[5]).toBe(attributes[5]);
  //
  setAttributePositionAction(
    noActionNotificationServiceWriter,
    visualModel,
  visualModel.getVisualEntitiesForRepresented("0")![0]!.identifier,
  attributes[5],
  1);

  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content[0]).toBe(attributes[0]);
  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content[1]).toBe(attributes[5]);
  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content[2]).toBe(attributes[1]);
  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content[3]).toBe(attributes[3]);
  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content[4]).toBe(attributes[4]);
  expect((visualModel.getVisualEntitiesForRepresented("0")![0] as VisualNode).content[5]).toBe(attributes[2]);
});

// Heavily inspired by createSemanticAttribute
// We are doing this so:
// 1) We don't have to export the createSemanticAttribute method
// 2) It is less work
function createSemanticAttributeTestVariant(
  models: Map<string, EntityModel>,
  domainConceptIdentifier: string,
  ModelDsIdentifier: string,
  attributeName: string,
) {

  const range = representRdfsLiteral();
  const name = {"en": attributeName};
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
      concept: range.identifier,
      cardinality: [0, 1],
      iri: generateIriForName(name["en"]),
    }]
  });

  const model: InMemorySemanticModel = models.get(ModelDsIdentifier) as InMemorySemanticModel;
  const newAttribute = model.executeOperation(operation) as CreatedEntityOperationResult;
  if (newAttribute.success === false || newAttribute.id === undefined) {
    fail("Failed in attribute creation");
  }

  return {
    identifier: newAttribute.id,
    model,
  };
}

function createSemanticAttributeUsageTestVariant(
  models: Map<string, EntityModel>,
  domainAttribute: string,
  domainConceptIdentifier: string,
  modelDsIdentifier: string,
  attributeName: string,
) {
  const range = representRdfsLiteral();
  const name = {"en": attributeName};
  const operation = createRelationshipUsage({
    ends: [{
      iri: null,
      name: {},
      description: {},
      concept: domainConceptIdentifier,
      cardinality: [0, 1],
      usageNote: null
    }, {
      name,
      description: {},
      concept: range.identifier,
      cardinality: [0, 1],
      iri: generateIriForName(name["en"]),
      usageNote: null
    }],
    usageOf: domainAttribute
  });

  const model: InMemorySemanticModel = models.get(modelDsIdentifier) as InMemorySemanticModel;
  const newAttribute = model.executeOperation(operation) as CreatedEntityOperationResult;
  if (newAttribute.success === false || newAttribute.id === undefined) {
    fail("Failed in attribute creation");
  }

  return {
    identifier: newAttribute.id,
    model,
  };
}

const generateIriForName = (name: string) => {
  return name + "-iri.cz";
}

//
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

  return {
    visualModel,
    modelIdentifier,
    modelAlias,
    visualIdentifiers,
    models,
    model,
    cmeModels
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