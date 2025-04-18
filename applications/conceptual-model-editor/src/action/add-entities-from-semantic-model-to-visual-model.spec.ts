/**
 * Tests {@link addEntitiesFromSemanticModelToVisualModelAction}
 */

import { expect, test, beforeEach, vitest } from "vitest";
import { SemanticModelAggregator, SemanticModelAggregatorView } from "@dataspecer/core-v2/semantic-model/aggregator";
import { createDefaultVisualModelFactory, isVisualNode, isVisualRelationship, VisualNode, WritableVisualModel } from "@dataspecer/core-v2/visual-model";
import { semanticModelMapToCmeSemanticModel } from "../dataspecer/cme-model/adapter/";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { Entity, EntityModel } from "@dataspecer/core-v2";
import { ModelGraphContextType } from "../context/model-context";
import { SetStateAction } from "react";
import { createClass, CreatedEntityOperationResult, createGeneralization, createRelationship } from "@dataspecer/core-v2/semantic-model/operations";
import { representRdfsLiteral } from "../dialog/utilities/dialog-utilities";
import { DiagramActions, DiagramCallbacks, Edge, Group, GroupWithContent, Node, Position, ViewportDimensions } from "../diagram";
import { ClassesContextType } from "../context/classes-context";
import { addEntitiesFromSemanticModelToVisualModelAction } from "./add-entities-from-semantic-model-to-visual-model";
import { isSemanticModelClass, isSemanticModelRelationship, SemanticModelClass, SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { UseDiagramType } from "../diagram/diagram-hook";
import { isSemanticModelRelationshipProfile } from "@dataspecer/core-v2/semantic-model/profile/concepts";
import { createCmeModelOperationExecutor } from "../dataspecer/cme-model/cme-model-operation-executor";
import { notificationMockup } from "./test/actions-test-suite";
import { CmeReference, CmeSpecialization } from "../dataspecer/cme-model/model";
import { fail } from "@/utilities/fail-test";

// TODO RadStr: For now - since layout prints a lot of debug stuff
//             (based on https://stackoverflow.com/questions/44467657/better-way-to-disable-console-inside-unit-tests)
beforeEach(() => {
  vitest.spyOn(console, "warn").mockImplementation(() => {});
  vitest.spyOn(console, "info").mockImplementation(() => {});
  vitest.spyOn(console, "log").mockImplementation(() => {});
});

test("Test - no relationships", async () => {
  const {
    classesContext,
    graph,
    models,
    visualModel,
  } = prepareModelsWithSemanticData();
  const diagram = createTestDiagramForNodePlacement();
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

test("Test - square (4 classes connected in a way that it looks like square)", async () => {
  const {
    classesContext,
    graph,
    models,
    visualModel,
  } = prepareModelsWithSemanticData();
  const diagram = createTestDiagramForNodePlacement();
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

test("Test - fully connected graph", async () => {
  const {
    classesContext,
    graph,
    models,
    visualModel,
  } = prepareModelsWithSemanticData();
  const diagram = createTestDiagramForNodePlacement();
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

test("Test - fully connected graph - Test attribute visibility when showing hidden class", async () => {
  const {
    classesContext,
    graph,
    models,
    visualModel,
  } = prepareModelsWithSemanticData();
  const diagram = createTestDiagramForNodePlacement();
  const relevantModel = [...models.entries()][2][1];
  const classWithAttribute = Object.values(relevantModel.getEntities()).find(entity => isSemanticModelClass(entity))!.id;
  const createdAttribute = createSemanticAttributeTestVariant(
    classesContext, models, classWithAttribute, relevantModel.getId(), "attr-1");
  const createdAttributeProfile = createSemanticAttributeProfileTestVariant(
    classesContext, models, createdAttribute.identifier, classWithAttribute, relevantModel.getId());
  await addEntitiesFromSemanticModelToVisualModelAction(
    notificationMockup, classesContext, graph,
    diagram, visualModel, relevantModel);

  const result = [...visualModel.getVisualEntities().entries()].map(entity => entity[1]);
  const nodes = result.filter(isVisualNode);
  const edges = result.filter(isVisualRelationship);
  expect(result.length).toBe(10);  // 4 nodes + 6 edges
  expect(nodes.length).toBe(4);
  expect(edges.length).toBe(6);
  //
  const expectedRepresentedNodeIds = Object.values(relevantModel.getEntities()).filter(isSemanticModelClass).map(entity => entity.id).sort();
  expect(nodes.map(node => node.representedEntity).sort()).toEqual(expectedRepresentedNodeIds);
  //
  const expectedRelationshipRepresentedIds = Object.values(relevantModel.getEntities())
    .filter(isSemanticModelRelationship)
    .filter(relationship => relationship.id !== createdAttribute.identifier)
    .map(relationship => relationship.id).sort();
  expect(edges.map(edge => edge.representedRelationship).sort()).toEqual(expectedRelationshipRepresentedIds);
  // Check attribute validity
  const nodeWithAttributeContent = (visualModel.getVisualEntitiesForRepresented(classWithAttribute)[0] as VisualNode).content;
  expect(nodeWithAttributeContent.length).toBe(2);
  expect(nodeWithAttributeContent[0]).toBe(createdAttribute.identifier);
  expect(nodeWithAttributeContent[1]).toBe(createdAttributeProfile.identifier);
});

test("Test - fully connected graph - Test attribute visibility when clicking the show vocabulary" +
  "with one visible class which has one visible and one hidden attribute", async () => {
  const {
    classesContext,
    graph,
    models,
    visualModel,
  } = prepareModelsWithSemanticData();
  const diagram = createTestDiagramForNodePlacement();
  const relevantModel = [...models.entries()][2][1];
  const classWithAttribute = Object.values(relevantModel.getEntities()).find(entity => isSemanticModelClass(entity))!.id;
  const createdAttribute = createSemanticAttributeTestVariant(
    classesContext, models, classWithAttribute, relevantModel.getId(), "attr-1");
  const createdAttributeProfile = createSemanticAttributeProfileTestVariant(
    classesContext, models, createdAttribute.identifier, classWithAttribute, relevantModel.getId());
  visualModel.addVisualNode({
    representedEntity: classWithAttribute,
    model: relevantModel.getId(),
    position: {x: 0, y: 0, anchored: null},
    content: [createdAttributeProfile.identifier],
    visualModels: []
  });
  expect((visualModel.getVisualEntitiesForRepresented(classWithAttribute)[0] as VisualNode).content)
    .toEqual([createdAttributeProfile.identifier]);
  //
  await addEntitiesFromSemanticModelToVisualModelAction(
    notificationMockup, classesContext, graph,
    diagram, visualModel, relevantModel);

  const result = [...visualModel.getVisualEntities().entries()].map(entity => entity[1]);
  const nodes = result.filter(isVisualNode);
  const edges = result.filter(isVisualRelationship);
  expect(result.length).toBe(10);     // 4 nodes + 6 edges
  expect(nodes.length).toBe(4);
  expect(edges.length).toBe(6);
  //
  const expectedRepresentedNodeIds = Object.values(relevantModel.getEntities()).filter(isSemanticModelClass).map(entity => entity.id).sort();
  expect(nodes.map(node => node.representedEntity).sort()).toEqual(expectedRepresentedNodeIds);
  //
  const expectedRelationshipRepresentedIds = Object.values(relevantModel.getEntities())
    .filter(isSemanticModelRelationship)
    .filter(relationship => relationship.id !== createdAttribute.identifier)
    .map(relationship => relationship.id).sort();
  expect(edges.map(edge => edge.representedRelationship).sort()).toEqual(expectedRelationshipRepresentedIds);
  // Check attribute validity
  const nodeWithAttributeContent = (visualModel.getVisualEntitiesForRepresented(classWithAttribute)[0] as VisualNode).content;
  expect(nodeWithAttributeContent.length).toBe(2);
  expect(nodeWithAttributeContent[0]).toBe(createdAttributeProfile.identifier);
  expect(nodeWithAttributeContent[1]).toBe(createdAttribute.identifier);
});

// Down from here are helper methods
// TODO RadStr: So really should put it all in one class named ActionsTestSuite

const createClassesContextTypeForTests = (
  _models: Map<string, EntityModel>,
  givenClasses: CmeReference[],
  givenRelationships: CmeReference[]
): ClassesContextType => {
  const classesAsSemanticEntities: SemanticModelClass[] = [];
  givenClasses.forEach(item => {
    classesAsSemanticEntities.push(
      _models.get(item.model)?.getEntities()[item.identifier] as SemanticModelClass);
  });

  const relationshipsAsSemanticEntities: SemanticModelRelationship[] = [];
  givenRelationships.forEach(relationship => {
    relationshipsAsSemanticEntities.push(
      _models.get(relationship.model)?.getEntities()[relationship.identifier] as SemanticModelRelationship);
  });
  const classes: ClassesContextType = {
    classes: classesAsSemanticEntities,
    allowedClasses: [],
    setAllowedClasses: function (_) { },
    relationships: relationshipsAsSemanticEntities,
    generalizations: [],
    usages: [],
    sourceModelOfEntityMap: new Map(),
    rawEntities: (classesAsSemanticEntities as Entity[]).concat(relationshipsAsSemanticEntities),
    classProfiles: [],
    relationshipProfiles: []
  };

  return classes;
};

const generateIriForName = (name: string) => {
  return name + "-iri.cz";
}

function createSemanticClassTestVariant(
  models: Map<string, EntityModel>,
  givenName: string,
  dsIdentifier: string,
  specializations: CmeSpecialization[],
): CmeReference | null {

  const name = {"en": givenName};

  const operation = createClass({
    iri: generateIriForName(givenName),
    name,
    description: {},
  });

  const model: InMemorySemanticModel = models.get(dsIdentifier) as InMemorySemanticModel;
  const newClass = model.executeOperation(operation) as CreatedEntityOperationResult;
  if (newClass.success === false || newClass.id === undefined) {
    return null;
  }

  // Perform additional modifications for which we need to have the class identifier.
  const operations = [];
  for (const specialization of specializations) {
    operations.push(createGeneralization({
      parent: specialization.specializationOf.identifier,
      child: newClass.id,
      iri: specialization.iri,
    }));
  }
  model.executeOperations(operations);

  return {
    identifier: newClass.id,
    model: model.getId(),
  };

}

/**
 * Creates 3 models, each containing 4 classes.
 * 1st one has no relationships,
 * 2nd forms square
 * 3rd fully connected graph
 */
const prepareModelsWithSemanticData = () => {
  const visualModel: WritableVisualModel = createDefaultVisualModelFactory().createNewWritableVisualModelSync();
  const modelIdentifier = "TEST-MODEL";
  const modelAlias = "TEST MODEL";
  const models : Map<string, EntityModel> = new Map();
  const modelCount = 3;
  const createdClasses: CmeReference[][] = [];
  const createdRelationships: CmeReference[][] = [];

  const aggregator = new SemanticModelAggregator();
  aggregator.addModel(visualModel);
  const aggregatorView = aggregator.getView();
  aggregatorView.changeActiveVisualModel(visualModel.getIdentifier());
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
  for(let i = 0; i < modelCount; i++) {
    const model = new InMemorySemanticModel();
    model.setAlias(modelAlias);
    models.set(model.getId(), model);
    aggregator.addModel(model);
    createdClasses.push([]);
    createdRelationships.push([]);
  }

  // Fill with data
  const cmeModels = semanticModelMapToCmeSemanticModel(models, visualModel, "", identifier => identifier);
  for(let i = 0; i < modelCount; i++) {
    for(let j = 0; j < 4; j++) {
      const createdClass = createSemanticClassTestVariant(models, `${i}-${j}`, cmeModels[i].dsIdentifier, []);
      if(createdClass === null) {
        fail("Failed on setup");
      }
      createdClasses[i].push(createdClass);
    }
    let squareRelationships;
    let createdDiagonalRelationship;
    switch(i) {
    case 0:
      break;
    case 1:
      squareRelationships = createRelationshipSquare(models, cmeModels[i].dsIdentifier, createdClasses, i);
      createdRelationships[i].push(...squareRelationships);
      break;
    case 2:
      squareRelationships = createRelationshipSquare(models, cmeModels[i].dsIdentifier, createdClasses, i);
      createdRelationships[i].push(...squareRelationships);
      createdDiagonalRelationship = createSemanticRelationshipTestVariant(
        models, createdClasses[i][0].identifier,
        createdClasses[i][3].identifier, cmeModels[i].dsIdentifier, "");
      createdRelationships[i].push(createdDiagonalRelationship);
      createdDiagonalRelationship = createSemanticRelationshipTestVariant(
        models, createdClasses[i][1].identifier,
        createdClasses[i][2].identifier, cmeModels[i].dsIdentifier, "");
      createdRelationships[i].push(createdDiagonalRelationship);
      break;
    default:
      fail("Failed on setup");
    }
  }

  const classesContext = createClassesContextTypeForTests(
    models,
    createdClasses.flat(),
    createdRelationships.flat()
  );

  return {
    visualModel,
    modelIdentifier,
    modelAlias,
    models,
    cmeModels,
    graph,
    classesContext
  };
}

const createRelationshipSquare = (
  models: Map<string, EntityModel>,
  dsIdentifier: string,
  createdClasses: CmeReference[][],
  currentModel: number,
): CmeReference[] => {
  const createdRelationships = [];
  for(let i = 0; i < 4; i++) {
    const created = createSemanticRelationshipTestVariant(
      models,
      createdClasses[currentModel][i].identifier,
      createdClasses[currentModel][(i+1)%4].identifier,
      dsIdentifier, "");
    createdRelationships.push(created);
  }

  return createdRelationships;
}

// Heavily inspired by createSemanticAssociationInternal
// We are doing this so:
// 1) We don't have create the state for the method
// 2) It is less work
function createSemanticRelationshipTestVariant(
  models: Map<string, EntityModel>,
  domainConceptIdentifier: string,
  rangeConceptIdentifier: string,
  modelDsIdentifier: string,
  relationshipName: string,
): CmeReference {
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
  const specializations: CmeSpecialization[] = [];
  for (const specialization of specializations) {
    operations.push(createGeneralization({
      parent: specialization.specializationOf.identifier,
      child: newAssociation.id,
      iri: specialization.iri,
    }));
  }
  model.executeOperations(operations);

  return {
    identifier: newAssociation.id,
    model: model.getId(),
  };
}

const createTestDiagramForNodePlacement = () => {
  const diagram: UseDiagramType = {
    areActionsReady: false,
    actions: function (): DiagramActions {
      const diagramActions: DiagramActions = {
        getGroups: function (): Group[] {
          throw new Error("Function not implemented.");
        },
        addGroups: function (_groups: GroupWithContent[], _hideAddedTopLevelGroups: boolean): void {
          throw new Error("Function not implemented.");
        },
        removeGroups: function (_groups: string[]): void {
          throw new Error("Function not implemented.");
        },
        setGroup: function (_group: Group, _content: string[]): void {
          throw new Error("Function not implemented.");
        },
        getGroupContent: function (_group: Group): string[] {
          throw new Error("Function not implemented.");
        },
        getNodes: function (): Node[] {
          throw new Error("Function not implemented.");
        },
        addNodes: function (_nodes: Node[]): void {
          throw new Error("Function not implemented.");
        },
        updateNodes: function (_nodes: Node[]): void {
          throw new Error("Function not implemented.");
        },
        updateNodesPosition: function (_nodes: { [identifier: string]: Position; }): void {
          throw new Error("Function not implemented.");
        },
        removeNodes: function (_identifiers: string[]): void {
          throw new Error("Function not implemented.");
        },
        getNodeWidth: function (_identifier: string): number | null {
          return 0;
        },
        getNodeHeight: function (_identifier: string): number | null {
          return 0;
        },
        getEdges: function (): Edge[] {
          throw new Error("Function not implemented.");
        },
        addEdges: function (_edges: Edge[]): void {
          throw new Error("Function not implemented.");
        },
        updateEdges: function (_edges: Edge[]): void {
          throw new Error("Function not implemented.");
        },
        setEdgesWaypointPosition: function (_positions: { [identifier: string]: Position[]; }): void {
          throw new Error("Function not implemented.");
        },
        removeEdges: function (_identifiers: string[]): void {
          throw new Error("Function not implemented.");
        },
        getSelectedNodes: function (): Node[] {
          throw new Error("Function not implemented.");
        },
        setSelectedNodes: function (_selectedNodes: string[]): void {
          throw new Error("Function not implemented.");
        },
        getSelectedEdges: function (): Edge[] {
          throw new Error("Function not implemented.");
        },
        setSelectedEdges: function (_edges: string[]): void {
          throw new Error("Function not implemented.");
        },
        setContent: function (_nodes: Node[], _edges: Edge[], _groups: GroupWithContent[]): Promise<void> {
          throw new Error("Function not implemented.");
        },
        getViewport: function (): ViewportDimensions {
          return {
            position: {
              x: 0,
              y: 0
            },
            width: 0,
            height: 0
          };
        },
        setViewportToPosition: function (_x: number, _y: number): void {
          throw new Error("Function not implemented.");
        },
        centerViewportToNode: function (_identifier: string): void {
          throw new Error("Function not implemented.");
        },
        fitToView: function (_identifiers: string[]): void {
          throw new Error("Function not implemented.");
        },
        renderToSvgString: function (): Promise<string | null> {
          throw new Error("Function not implemented.");
        },
        openDragEdgeToCanvasMenu: function (_sourceNode: Node, _canvasPosition: Position): void {
          throw new Error("Function not implemented.");
        },
        openSelectionActionsMenu: function (_sourceNode: Node, _canvasPosition: Position): void {
          throw new Error("Function not implemented.");
        },
        openGroupMenu: function (_groupIdentifier: string, _canvasPosition: Position): void {
          throw new Error("Function not implemented.");
        },
        highlightNodesInExplorationModeFromCatalog: function (
          _nodeIdentifiers: string[],
          _modelOfClassWhichStartedHighlighting: string
        ): void {
          throw new Error("Function not implemented.");
        },
      }

      return diagramActions;
    },
    setActions: function (_nextActions: DiagramActions): void {
      throw new Error("Function not implemented.");
    },
    callbacks: function (): DiagramCallbacks {
      throw new Error("Function not implemented.");
    },
    setCallbacks: function (_nextCallbacks: DiagramCallbacks): void {
      throw new Error("Function not implemented.");
    }
  };

  return diagram;
}

function createSemanticAttributeTestVariant(
  classesContext: ClassesContextType,
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

  const createdAttribute = model.getEntities()[newAttribute.id];
  if(!isSemanticModelRelationship(createdAttribute)) {
    fail("Failed on set-up when creating semantic attribute")
  }
  classesContext.relationships.push(createdAttribute);
  return {
    identifier: newAttribute.id,
    model,
  };
}

function createSemanticAttributeProfileTestVariant(
  classesContext: ClassesContextType,
  models: Map<string, EntityModel>,
  domainAttribute: string,
  domainConceptIdentifier: string,
  modelDsIdentifier: string,
) {
  const range = representRdfsLiteral();

  const model: InMemorySemanticModel = models.get(modelDsIdentifier) as InMemorySemanticModel;
  const executor = createCmeModelOperationExecutor(models);
  const result = executor.createRelationshipProfile({
    model: modelDsIdentifier,
    profileOf: ["Does", "Not", "Matter"],
    iri: generateIriForName(domainAttribute),
    name: null,
    nameSource: null,
    description: null,
    descriptionSource: null,
    usageNote: null,
    usageNoteSource: null,
    //
    domain: domainConceptIdentifier,
    domainCardinality: null,
    range: range.identifier,
    rangeCardinality: null,
    externalDocumentationUrl: null,
    mandatoryLevel: null,
  });

  const createdAttributeProfile = model.getEntities()[result.identifier];
  if(!isSemanticModelRelationshipProfile(createdAttributeProfile)) {
    fail("Failed on set-up when creating semantic attribute profile")
  }
  classesContext.relationshipProfiles.push(createdAttributeProfile);

  return {
    identifier: result.identifier,
    model,
  };
}
