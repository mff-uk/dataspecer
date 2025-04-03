import { Entity, EntityModel } from "@dataspecer/core-v2";
import {
  DiagramActions,
  DiagramCallbacks,
  Group,
  GroupWithContent,
  Node,
  Edge,
  Position,
  ViewportDimensions,
  NodeType,
  EdgeType
} from "../../diagram";
import { UseDiagramType } from "../../diagram/diagram-hook";
import { UseNotificationServiceWriterType } from "../../notification/notification-service-context";
import { ClassesContextType } from "@/context/classes-context";
import { SemanticModelClass, SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { createClass, CreatedEntityOperationResult, createGeneralization, createRelationship } from "@dataspecer/core-v2/semantic-model/operations";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { SetStateAction } from "react";
import { createDefaultVisualModelFactory, isVisualNode, WritableVisualModel } from "@dataspecer/core-v2/visual-model";
import { SemanticModelAggregator, SemanticModelAggregatorView } from "@dataspecer/core-v2/semantic-model/aggregator";
import { XY } from "@dataspecer/layout";
import { ModelGraphContextType } from "@/context/model-context";
import { CmeSpecialization } from "@/dataspecer/cme-model/model";

type CreatedSemanticEntityData = {
  identifier: string,
  model: InMemorySemanticModel
};

/**
 * This class contains most of the relevant methods needed for testing of actions.
 * That is handling of creation of elements and models.
 * However it is very basic and can be extended
 */
export class ActionsTestSuite {
  /**
   *
   * @param diagramActionsSpecifiedByUser specify some actions as user needs for the tested code
   * @returns Returns diagram with most actions throwing error.
   * But some methods do have legitimate implementation.
   */
  static createTestDiagram(diagramActionsSpecifiedByUser?: Partial<DiagramActions>) {
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
            return 200;
          },
          getNodeHeight: function (_identifier: string): number | null {
            return 100;
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
              position: {x: 0, y: 0},
              width: 100,
              height: 100,
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
          }
        }

        if(diagramActionsSpecifiedByUser !== undefined) {
          return {
            ...diagramActions,
            ...diagramActionsSpecifiedByUser
          };
        }
        return {
          ...diagramActions,
        };
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


  static createTestDiagramNode = (id: string) => {
    const node: Node = {
      type: NodeType.Class,
      identifier: id,
      externalIdentifier: `e${id}`,
      label: "",
      description: null,
      iri: null,
      color: "",
      group: null,
      position: {x: 0, y: 0, anchored: true},
      profileOf: null,
      items: []
    };
    return node;
  };

  static createTestDiagramEdge = (id: string) => {
    const edge: Edge = {
      type: EdgeType.Association,
      identifier: id,
      externalIdentifier: `e${id}`,
      label: null,
      source: "",
      cardinalitySource: null,
      target: "",
      cardinalityTarget: null,
      color: "",
      waypoints: [],
      profileOf: null
    }
    return edge;
  };

  static createClassesContextTypeForTests = (
    models: Map<string, EntityModel>,
    givenClasses: CreatedSemanticEntityData[],
    givenRelationships: CreatedSemanticEntityData[]
  ): ClassesContextType => {
    const classesAsSemanticEntities: SemanticModelClass[] = [];
    givenClasses.forEach(cclass => {
      classesAsSemanticEntities.push(cclass.model.getEntities()[cclass.identifier] as SemanticModelClass);
    });

    const relationshipsAsSemanticEntities: SemanticModelRelationship[] = [];
    givenRelationships.forEach(relationship => {
      relationshipsAsSemanticEntities.push(relationship.model.getEntities()[relationship.identifier] as SemanticModelRelationship);
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

  static generateIriForName = (name: string) => {
    return name + "-iri.cz";
  }

  static createSemanticClassTestVariant(
    models: Map<string, EntityModel>,
    givenName: string,
    dsIdentifier: string,
    specializations: CmeSpecialization[],
    identifier?: string
  ): CreatedSemanticEntityData | null {

    const name = {"en": givenName};

    const operation = createClass({
      iri: ActionsTestSuite.generateIriForName(givenName),
      name,
      description: {},
      id: identifier
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
      model,
    };
  }

  /**
   * Creates 3 models, each containing 4 classes.
   * 1st one has no relationships,
   * 2nd forms square
   * 3rd fully connected graph.
   *
   * Also creates visual model with 1-4 nodes based on given {@link visualModelSize}
   */
  static prepareModelsWithSemanticData = (visualModelSize: number) => {
    const visualModel: WritableVisualModel = createDefaultVisualModelFactory().createNewWritableVisualModelSync();
    const modelAlias = "TEST MODEL";
    const models : Map<string, EntityModel> = new Map();
    const modelCount = 3;
    const createdClasses: CreatedSemanticEntityData[][] = [];
    const createdRelationships: CreatedSemanticEntityData[][] = [];
    let firstModel: InMemorySemanticModel | null = null;
    const visualIdentifiers: string[] = [];

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
      if (i === 0) {
        firstModel = model;
      }
      model.setAlias(modelAlias);
      models.set(model.getId(), model);
      aggregator.addModel(model);
      createdClasses.push([]);
      createdRelationships.push([]);
    }

    // Fill with data

    for(let i = 0; i < visualModelSize; i++) {
      const visualIdentifier = ActionsTestSuite.createNewVisualNodeForTesting(
        visualModel, firstModel!.getId(), `${i}`);
      visualIdentifiers.push(visualIdentifier);
    }


    const modelIdentifiers = [...models.keys()]
    for(let i = 0; i < modelCount; i++) {
      for(let j = 0; j < 4; j++) {
        const createdClass = ActionsTestSuite.createSemanticClassTestVariant(
          models, `${i}-${j}`, modelIdentifiers[i], [], (j + (4*i)).toString());
        if(createdClass === null) {
          fail("Failed on setup");
        }
        createdClasses[i].push(createdClass);
      }

      let squareRelationships;
      switch(i) {
        case 0:
          break;
        case 1:
          squareRelationships = ActionsTestSuite.createRelationshipSquare(
            models, modelIdentifiers[i], createdClasses, i);
          createdRelationships[i].push(...squareRelationships);
          break;
        case 2:
          squareRelationships = ActionsTestSuite.createRelationshipSquare(
            models, modelIdentifiers[i], createdClasses, i);
          createdRelationships[i].push(...squareRelationships);
          let createdDiagonalRelationship = ActionsTestSuite.createSemanticRelationshipTestVariant(
              models, createdClasses[i][0].identifier,
              createdClasses[i][2].identifier, modelIdentifiers[i], "");
          createdRelationships[i].push(createdDiagonalRelationship);
          createdDiagonalRelationship = ActionsTestSuite.createSemanticRelationshipTestVariant(
            models, createdClasses[i][1].identifier,
            createdClasses[i][3].identifier, modelIdentifiers[i], "");
          createdRelationships[i].push(createdDiagonalRelationship);
          break;
        default:
          fail("Failed on setup");
      }
    }

    const classesContext = ActionsTestSuite.createClassesContextTypeForTests(
      models,
      createdClasses.flat(),
      createdRelationships.flat()
    );

    return {
      visualModel,
      visualIdentifiers,
      modelAlias,
      model: firstModel as InMemorySemanticModel,
      models,
      graph,
      classesContext
    };
  }

  static createRelationshipSquare = (
    models: Map<string, EntityModel>,
    dsIdentifier: string,
    createdClasses: CreatedSemanticEntityData[][],
    currentModel: number,
  ): CreatedSemanticEntityData[] => {
    const createdRelationships = [];
    for(let i = 0; i < 4; i++) {
      const created = ActionsTestSuite.createSemanticRelationshipTestVariant(
        models,
        createdClasses[currentModel][i].identifier,
        createdClasses[currentModel][(i+1)%4].identifier,
        dsIdentifier, "");
      createdRelationships.push(created);
    }

    return createdRelationships;
  }

  static createNewVisualNodeForTesting(
    visualModel: WritableVisualModel,
    model: string,
    representedEntity: string,
    position?: XY
  ) {
    const visualId = visualModel.addVisualNode({
      representedEntity: representedEntity,
      model,
      content: [],
      visualModels: [],
      position: position !== undefined ? {...position, anchored: null} : { x: 0, y: 0, anchored: null },
    });

    return visualId;
  }

  // Heavily inspired by createSemanticAssociationInternal
  // We are doing this so:
  // 1) We don't have create the state for the method
  // 2) It is less work
  static createSemanticRelationshipTestVariant(
    models: Map<string, EntityModel>,
    domainConceptIdentifier: string,
    rangeConceptIdentifier: string,
    modelDsIdentifier: string,
    relationshipName: string,
  ): CreatedSemanticEntityData {
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
        iri: ActionsTestSuite.generateIriForName(name["en"]),
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
      model,
    };
  }

  private static currentRepresentedRelationshipIdentifier = 0;
  static createNewVisualRelationshipsForTestingFromSemanticEnds(
    visualModel: WritableVisualModel,
    model: string,
    semanticSourceIdentifier: string,
    semanticTargetIdentifier: string,
    representedRelationshipIdentifier?: string,
  ) {
    const visualSource = visualModel.getVisualEntitiesForRepresented(semanticSourceIdentifier)[0];
    const visualTarget = visualModel.getVisualEntitiesForRepresented(semanticTargetIdentifier)[0];
    if(visualSource === undefined ||
      visualTarget === undefined ||
      !isVisualNode(visualSource) ||
      !isVisualNode(visualTarget)) {
      fail("Failed when creating visual relationship for testing - programmer error");
    }
    const visualId = visualModel.addVisualRelationship({
      model: model,
      representedRelationship: representedRelationshipIdentifier ??
        `r-${ActionsTestSuite.currentRepresentedRelationshipIdentifier++}`,
      waypoints: [{
        x: 0, y: 2,
        anchored: null
      }],
      visualSource: visualSource.identifier,
      visualTarget: visualTarget.identifier,
    });

    return visualId;
  }

}

// TODO RadStr: Put into class - and rewrite it as function which returns the notification object.
export const notificationMockup: UseNotificationServiceWriterType = {
  success: () => { },
  error: () => { },
};
