// /**
//  * Tests the {@link createDefaultProfilesAction}
//  */

// import { expect, test } from "vitest";
// import { SemanticModelAggregator, SemanticModelAggregatorView } from "@dataspecer/core-v2/semantic-model/aggregator";
// import { createDefaultVisualModelFactory, isVisualNode, isVisualProfileRelationship, isVisualRelationship, VisualNode, WritableVisualModel } from "@dataspecer/core-v2/visual-model";
// import { entityModelsMapToCmeVocabulary } from "../../dataspecer/semantic-model/semantic-model-adapter";
// import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
// import { Entity, EntityModel } from "@dataspecer/core-v2";
// import { ModelGraphContextType } from "../../context/model-context";
// import { SetStateAction } from "react";
// import { createClass, CreatedEntityOperationResult, createGeneralization, createRelationship } from "@dataspecer/core-v2/semantic-model/operations";
// import { ExplicitAnchors, UserGivenAlgorithmConfigurationStress, UserGivenConstraintsVersion4, XY, getDefaultMainUserGivenAlgorithmConstraint, getDefaultUserGivenConstraintsVersion4 } from "@dataspecer/layout";
// import { Specialization } from "../../dialog/utilities/dialog-utilities";
// import { DiagramActions, DiagramCallbacks, Edge, EdgeType, Group, GroupWithContent, Node, NodeType, Position, ViewportDimensions } from "../../diagram";
// import { ClassesContextType } from "../../context/classes-context";
// import { CreatedSemanticEntityData } from "../open-create-class-dialog";
// import { addEntitiesFromSemanticModelToVisualModelAction } from "../add-entities-from-semantic-model-to-visual-model";
// import { noActionNotificationServiceWriter } from "../../notification/notification-service-context";
// import { isSemanticModelClass, isSemanticModelGeneralization, isSemanticModelRelationship, SEMANTIC_MODEL_GENERALIZATION, SemanticModelClass, SemanticModelGeneralization, SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
// import { UseDiagramType } from "../../diagram/diagram-hook";
// import { filterSelectionAction, SelectionFilter, SelectionsWithIdInfo } from "../filter-selection-action";
// import { extendSelectionAction, ExtensionType, NodeSelection, VisibilityFilter } from "../extend-selection-action";
// import { EditClassProfileDialogState } from "../../dialog/class-profile/edit-class-profile-dialog-controller";
// import { EditAttributeProfileDialogState } from "../../dialog/attribute-profile/edit-attribute-profile-dialog-controller";
// import { EditAssociationProfileDialogState } from "../../dialog/association-profile/edit-association-profile-dialog-controller";
// import { createCmeClassProfile } from "../../dataspecer/cme-model/operation/create-cme-class-profile";
// import { createCmeRelationshipProfile } from "../../dataspecer/cme-model/operation/create-cme-relationship-profile";
// import { addSemanticRelationshipProfileToVisualModelAction } from "../add-relationship-profile-to-visual-model";
// import { addSemanticRelationshipToVisualModelAction } from "../add-relationship-to-visual-model";
// import { addSemanticGeneralizationToVisualModelAction } from "../add-generalization-to-visual-model";
// import { isSemanticModelClassProfile, isSemanticModelRelationshipProfile, SemanticModelClassProfile, SemanticModelRelationshipProfile } from "@dataspecer/core-v2/semantic-model/profile/concepts";
// import { findPositionForNewNodesUsingLayouting, layoutActiveVisualModelAction } from "../layout-visual-model";
// import { Options } from "../../application";
// import { Language } from "../../application/options";
// import { createDefaultProfilesAction } from "../create-default-profiles";
// import { isSemanticModelRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";

// test("Try to profile all classes and relationships", async () => {
//   const {
//     classesContext,
//     graph,
//     models,
//     visualModel,
//   } = prepareModelsWithSemanticData(RelationshipToTestType.Association, null);
//   const diagram = createTestDiagramForDimensionHandling();
//   const fullyConnectedModel = [...models.entries()][2][1];
//   const firstInMemorySemanticModel = [...models.entries()][0][1];

//   const options: Options = {
//     language: Language.Czech,
//     setLanguage: function (_language: Language): void {
//       throw new Error("Function not implemented.");
//     }
//   };

//   const semanticClassesToProfile = Object.values(fullyConnectedModel.getEntities())
//     .filter(isSemanticModelClass)
//     .map(cclass => cclass.id);
//   const semanticRelationshipsToProfile = Object.values(fullyConnectedModel.getEntities())
//     .filter(isSemanticModelRelationship)
//     .map(relationship => relationship.id);

//   expect([...visualModel.getVisualEntities().entries()].length).toBe(0);

//   await createDefaultProfilesAction(
//     noActionNotificationServiceWriter, classesContext, options, graph, diagram,
//     visualModel, semanticClassesToProfile, semanticRelationshipsToProfile, true);
//   expect([...visualModel.getVisualEntities().entries()].length).toBe(10);
//   //
//   let classProfilesCount = 0;
//   let relationshipProfileCount = 0;
//   for(const entity of Object.values(firstInMemorySemanticModel.getEntities())) {
//     if(isSemanticModelClassProfile(entity)) {
//       classProfilesCount++;
//       expect(entity.profiling.length).toBe(1);
//       expect(fullyConnectedModel.getEntities()[entity.profiling[0]] !== undefined).toBeTruthy();
//     }
//     else if(isSemanticModelRelationshipProfile(entity)) {
//       relationshipProfileCount++;
//       expect(entity.ends[1].profiling.length).toBe(1);
//       expect(fullyConnectedModel.getEntities()[entity.ends[1].profiling[0]] !== undefined).toBeTruthy();
//     }
//   }
//   expect(classProfilesCount).toBe(4);
//   expect(relationshipProfileCount).toBe(6);
// });


// test("Try to create profiles of profiles of all classes and relationships", async () => {
//   const {
//     classesContext,
//     graph,
//     models,
//     visualModel,
//   } = prepareModelsWithSemanticData(RelationshipToTestType.Association, null);
//   const diagram = createTestDiagramForDimensionHandling();
//   const fullyConnectedModel = [...models.entries()][2][1];
//   const firstInMemorySemanticModel = [...models.entries()][0][1];

//   const options: Options = {
//     language: Language.Czech,
//     setLanguage: function (_language: Language): void {
//       throw new Error("Function not implemented.");
//     }
//   };


//   const semanticClassesToProfile = Object.values(fullyConnectedModel.getEntities())
//     .filter(isSemanticModelClass)
//     .map(cclass => cclass.id);
//   const semanticRelationshipsToProfile = Object.values(fullyConnectedModel.getEntities())
//     .filter(isSemanticModelRelationship)
//     .map(relationship => relationship.id);

//   expect([...visualModel.getVisualEntities().entries()].length).toBe(0);
//   await createDefaultProfilesAction(
//     noActionNotificationServiceWriter, classesContext, options, graph, diagram,
//     visualModel, semanticClassesToProfile, semanticRelationshipsToProfile, true);
//   expect([...visualModel.getVisualEntities().entries()].length).toBe(10);
//   //
//   let classProfiles = [];
//   let relationshipProfiles = [];
//   for(const entity of Object.values(firstInMemorySemanticModel.getEntities())) {
//     if(isSemanticModelClassProfile(entity)) {
//       expect(fullyConnectedModel.getEntities()[entity.profiling[0]] !== undefined).toBeTruthy();
//       classProfiles.push(entity.id);
//     }
//     else if(isSemanticModelRelationshipProfile(entity)) {
//       expect(fullyConnectedModel.getEntities()[entity.ends[1].profiling[0]] !== undefined).toBeTruthy();
//       relationshipProfiles.push(entity.id);
//     }
//   }
//   expect(classProfiles.length).toBe(4);
//   expect(relationshipProfiles.length).toBe(6);
//   //

//   // We have to update manually the test state of classContext !!!
//   classesContext.classProfiles = classProfiles.map(
//     classProfile =>
//       firstInMemorySemanticModel.getEntities()[classProfile] as SemanticModelClassProfile
//   );
//   classesContext.relationshipProfiles = relationshipProfiles.map(
//     relationshipProfile =>
//       firstInMemorySemanticModel.getEntities()[relationshipProfile] as SemanticModelRelationshipProfile
//   );

//   await createDefaultProfilesAction(
//     noActionNotificationServiceWriter, classesContext, options, graph, diagram,
//     visualModel, classProfiles, relationshipProfiles, true);
//   expect([...visualModel.getVisualEntities().entries()].length).toBe(24);

//   let classProfilesCount = 0;
//   let relationshipProfileCount = 0;
//   for(const entity of Object.values(firstInMemorySemanticModel.getEntities())) {
//     if(isSemanticModelClassProfile(entity)) {
//       classProfilesCount++;
//       expect(entity.profiling.length).toBe(1);
//       if(!classProfiles.includes(entity.id)) {
//         // In this case the profiled entity should be already class profile
//         expect(firstInMemorySemanticModel.getEntities()[entity.profiling[0]] !== undefined).toBeTruthy();
//         expect(classProfiles.includes(firstInMemorySemanticModel.getEntities()[entity.profiling[0]].id)).toBeTruthy();
//       }
//     }
//     else if(isSemanticModelRelationshipProfile(entity)) {
//       relationshipProfileCount++;
//       expect(entity.ends[1].profiling.length).toBe(1);
//       if(!relationshipProfiles.includes(entity.id)) {
//         // In this case the profiled entity should be already relationship profile
//         expect(firstInMemorySemanticModel.getEntities()[entity.ends[1].profiling[0]] !== undefined).toBeTruthy();
//         expect(relationshipProfiles.includes(firstInMemorySemanticModel.getEntities()[entity.ends[1].profiling[0]].id)).toBeTruthy();
//       }
//     }
//   }

//   expect(classProfilesCount).toBe(8);
//   expect(relationshipProfileCount).toBe(12);
// });

// test("Profile class + relationship going from the class", async () => {
//   const {
//     classesContext,
//     graph,
//     models,
//     visualModel,
//   } = prepareModelsWithSemanticData(RelationshipToTestType.Association, null);
//   const diagram = createTestDiagramForDimensionHandling();
//   const fullyConnectedModel = [...models.entries()][2][1];
//   const firstInMemorySemanticModel = [...models.entries()][0][1];

//   const options: Options = {
//     language: Language.Czech,
//     setLanguage: function (_language: Language): void {
//       throw new Error("Function not implemented.");
//     }
//   };

//   const semanticClassToProfile = Object.values(fullyConnectedModel.getEntities())
//     .filter(isSemanticModelClass)[0];
//   const semanticRelationshipsToProfile = Object.values(fullyConnectedModel.getEntities())
//     .filter(isSemanticModelRelationship)
//     .map(relationship => relationship);
//   const semanticRelationshipToProfile = semanticRelationshipsToProfile.find(
//     relationship =>
//       relationship.ends[0].concept === semanticClassToProfile.id
//   );
//   // Just sanity check for programming error in test
//   expect(semanticRelationshipToProfile !== undefined).toBeTruthy();
//   expect(semanticRelationshipToProfile!.ends[1].concept).not.toBeNull()
//   createNewVisualNodeForTesting(visualModel, fullyConnectedModel.getId(), semanticRelationshipToProfile!.ends[1].concept ?? "");

//   await createDefaultProfilesAction(
//     noActionNotificationServiceWriter, classesContext, options, graph, diagram,
//     visualModel, [semanticClassToProfile.id], [semanticRelationshipToProfile!.id], true);
//   expect([...visualModel.getVisualEntities().entries()].length).toBe(3);
//   //
//   let classProfilesCount = 0;
//   let createdProfile: SemanticModelClassProfile | null = null;
//   for(const entity of Object.values(firstInMemorySemanticModel.getEntities())) {
//     if(isSemanticModelClassProfile(entity)) {
//       classProfilesCount++;
//       createdProfile = entity;
//       expect(entity.profiling.length).toBe(1);
//       expect(fullyConnectedModel.getEntities()[entity.profiling[0]]).toEqual(semanticClassToProfile);
//     }
//   }

//   let relationshipProfileCount = 0;
//   for(const entity of Object.values(firstInMemorySemanticModel.getEntities())) {
//     if(isSemanticModelRelationshipProfile(entity)) {
//       relationshipProfileCount++;
//       expect(entity.ends[1].profiling.length).toBe(1);
//       expect(fullyConnectedModel.getEntities()[entity.ends[1].profiling[0]]).toEqual(semanticRelationshipToProfile);
//       expect(entity.ends[0].concept).not.toBeNull();
//       expect(entity.ends[0].concept).toBe(createdProfile!.id);
//       expect(entity.ends[1].concept).toBe(semanticRelationshipToProfile?.ends[1].concept);
//     }
//   }
//   expect(classProfilesCount).toBe(1);
//   expect(relationshipProfileCount).toBe(1);
// });


// test("Profile both ends of relationship + the relationship itself", async () => {
//   const {
//     classesContext,
//     graph,
//     models,
//     visualModel,
//   } = prepareModelsWithSemanticData(RelationshipToTestType.Association, null);
//   const diagram = createTestDiagramForDimensionHandling();
//   const fullyConnectedModel = [...models.entries()][2][1];
//   const firstInMemorySemanticModel = [...models.entries()][0][1];

//   const options: Options = {
//     language: Language.Czech,
//     setLanguage: function (_language: Language): void {
//       throw new Error("Function not implemented.");
//     }
//   };

//   const allSemanticClasses = Object.values(fullyConnectedModel.getEntities())
//     .filter(isSemanticModelClass);
//   const semanticRelationshipsToProfile = Object.values(fullyConnectedModel.getEntities())
//     .filter(isSemanticModelRelationship)
//     .map(relationship => relationship);
//   const semanticRelationshipToProfile = semanticRelationshipsToProfile[0];
//   const semanticClassesToProfile = allSemanticClasses.filter(
//     cclass =>
//       cclass.id === semanticRelationshipToProfile.ends[0].concept ||
//       cclass.id === semanticRelationshipToProfile.ends[1].concept
//   );
//   // Just sanity check for programming error in test
//   expect(semanticClassesToProfile.length).toBe(2);
//   createNewVisualNodeForTesting(visualModel, fullyConnectedModel.getId(), semanticClassesToProfile[0].id);
//   createNewVisualNodeForTesting(visualModel, fullyConnectedModel.getId(), semanticClassesToProfile[1].id);

//   await createDefaultProfilesAction(
//     noActionNotificationServiceWriter, classesContext, options, graph, diagram,
//     visualModel, [semanticClassesToProfile[0].id, semanticClassesToProfile[1].id],
//     [semanticRelationshipToProfile!.id], true);
//   // 2 classes, 2 class profiles, 2 class profiles edges, 1 relationship profile
//   expect([...visualModel.getVisualEntities().entries()].length).toBe(7);
//   //
//   let classProfilesCount = 0;
//   let createdProfiles: SemanticModelClassProfile[] = [];
//   for(const entity of Object.values(firstInMemorySemanticModel.getEntities())) {
//     if(isSemanticModelClassProfile(entity)) {
//       classProfilesCount++;
//       createdProfiles.push(entity);
//       expect(entity.profiling.length).toBe(1);
//       const sourceClass = fullyConnectedModel.getEntities()[entity.profiling[0]] as SemanticModelClass;
//       // The first profile should profile the first class
//       expect(semanticClassesToProfile[createdProfiles.length - 1]).toEqual(sourceClass);
//     }
//   }

//   let relationshipProfileCount = 0;
//   for(const entity of Object.values(firstInMemorySemanticModel.getEntities())) {
//     if(isSemanticModelRelationshipProfile(entity)) {
//       relationshipProfileCount++;
//       expect(entity.ends[1].profiling.length).toBe(1);
//       expect(fullyConnectedModel.getEntities()[entity.ends[1].profiling[0]]).toEqual(semanticRelationshipToProfile);
//       expect(entity.ends[0].concept).not.toBeNull();
//       expect(entity.ends[1].concept).not.toBeNull();
//       expect(entity.ends[0].concept).toBe(createdProfiles[0].id);
//       expect(entity.ends[1].concept).toBe(createdProfiles[1].id);
//     }
//   }
//   expect(classProfilesCount).toBe(2);
//   expect(relationshipProfileCount).toBe(1);
// });


// // //
// // // The test setup methods
// // //

// // const createTestDiagramNode = (
// //   id: string,
// //   represented: string,
// // ) => {
// //   const node: Node = {
// //     type: NodeType.Class,
// //     identifier: id,
// //     externalIdentifier: represented,
// //     label: "",
// //     description: null,
// //     iri: null,
// //     color: "",
// //     group: null,
// //     position: {x: 0, y: 0, anchored: true},
// //     profileOf: null,
// //     items: []
// //   };
// //   return node;
// // };

// // const createTestDiagramEdge = (id: string) => {
// //   const edge: Edge = {
// //     type: EdgeType.Association,
// //     identifier: id,
// //     externalIdentifier: `e${id}`,
// //     label: null,
// //     source: "",
// //     cardinalitySource: null,
// //     target: "",
// //     cardinalityTarget: null,
// //     color: "",
// //     waypoints: [],
// //     profileOf: null
// //   }
// //   return edge;
// // };

// // const createClassesContextTypeForTests = (
// //   givenClasses: CreatedSemanticEntityData[],
// //   givenRelationships: CreatedSemanticEntityData[],
// //   givenGeneralizations: CreatedSemanticEntityData[],
// //   givenRelationshipProfiles: CreatedSemanticEntityData[],
// // ): ClassesContextType => {
// //   const classesAsSemanticEntities: SemanticModelClass[] = [];
// //   givenClasses.forEach(cclass => {
// //     classesAsSemanticEntities.push(cclass.model.getEntities()[cclass.identifier] as SemanticModelClass);
// //   });

// //   const relationshipsAsSemanticEntities: SemanticModelRelationship[] = [];
// //   givenRelationships.forEach(relationship => {
// //     relationshipsAsSemanticEntities.push(relationship.model.getEntities()[relationship.identifier] as SemanticModelRelationship);
// //   });

// //   const generalizationsAsSemanticEntities: SemanticModelGeneralization[] = [];
// //   givenGeneralizations.forEach(generalization => {
// //     generalizationsAsSemanticEntities.push(generalization.model.getEntities()[generalization.identifier] as SemanticModelGeneralization);
// //   });

// //   const relationshipProfilesAsSemanticEntities: SemanticModelRelationshipProfile[] = [];
// //   givenRelationshipProfiles.forEach(relationshipProfile => {
// //     relationshipProfilesAsSemanticEntities.push(relationshipProfile.model.getEntities()[relationshipProfile.identifier] as SemanticModelRelationshipProfile);
// //   });


// //   const rawEntities = (classesAsSemanticEntities as Entity[])
// //                         .concat(relationshipsAsSemanticEntities)
// //                         .concat(generalizationsAsSemanticEntities)
// //                         .concat(relationshipProfilesAsSemanticEntities);

// //   const classes: ClassesContextType = {
// //     classes: classesAsSemanticEntities,
// //     allowedClasses: [],
// //     setAllowedClasses: function (_) { },
// //     relationships: relationshipsAsSemanticEntities,
// //     generalizations: generalizationsAsSemanticEntities,
// //     usages: [],
// //     sourceModelOfEntityMap: new Map(),
// //     rawEntities,
// //     classProfiles: [],
// //     relationshipProfiles: relationshipProfilesAsSemanticEntities
// //   };

// //   return classes;
// // };

// // const generateIriForName = (name: string) => {
// //   return name + "-iri.cz";
// // }

// // function createSemanticClassTestVariant(
// //   models: Map<string, EntityModel>,
// //   givenName: string,
// //   dsIdentifier: string,
// //   specializations: Specialization[],
// // ): CreatedSemanticEntityData | null {

// //   const name = {"en": givenName};

// //   const operation = createClass({
// //     iri: generateIriForName(givenName),
// //     name,
// //     description: {},
// //   });

// //   const model: InMemorySemanticModel = models.get(dsIdentifier) as InMemorySemanticModel;
// //   const newClass = model.executeOperation(operation) as CreatedEntityOperationResult;
// //   if (newClass.success === false || newClass.id === undefined) {
// //     return null;
// //   }

// //   // Perform additional modifications for which we need to have the class identifier.
// //   const operations = [];
// //   for (const specialization of specializations) {
// //     operations.push(createGeneralization({
// //       parent: specialization.specialized,
// //       child: newClass.id,
// //       iri: specialization.iri,
// //     }));
// //   }
// //   model.executeOperations(operations);

// //   return {
// //     identifier: newClass.id,
// //     model,
// //   };
// // }

// // function fillVisualModelWithData(
// //   modelToFillWith: EntityModel,
// //   visualmodelToFill: WritableVisualModel,
// //   relationshipToTestType: RelationshipToTestType,
// // ) {
// //   const nodes: string[] = [];
// //   const edges: string[] = [];
// //   // First add all nodes
// //   for(const entity of Object.values(modelToFillWith.getEntities())) {
// //     if(isSemanticModelClass(entity)) {
// //       const id = createNewVisualNodeForTesting(visualmodelToFill, modelToFillWith.getId(), entity.id);
// //       nodes.push(id);
// //     }
// //   }

// //   // Now add all edges since the ends already exist in visual model
// //   for(const entity of Object.values(modelToFillWith.getEntities())) {
// //     if(mapRelationshipTestTypeToSemanticCheck[relationshipToTestType](entity)) {
// //       let ends = [];
// //       if(relationshipToTestType === RelationshipToTestType.Generalization) {
// //         ends.push((entity as SemanticModelGeneralization).child);
// //         ends.push((entity as SemanticModelGeneralization).parent);
// //       }
// //       else {
// //         ends.push((entity as SemanticModelRelationship | SemanticModelRelationshipProfile).ends[0].concept);
// //         ends.push((entity as SemanticModelRelationship | SemanticModelRelationshipProfile).ends[1].concept);
// //       }
// //       if(ends[0] === null || ends[1] === null) {
// //         fail("Failed on test setup");
// //       }
// //       const id = createNewVisualRelationshipForTestingFromSemanticEnds(
// //         visualmodelToFill, modelToFillWith.getId(),
// //         ends[0],
// //         ends[1],
// //         entity.id
// //       );

// //       edges.push(id);
// //     }
// //   }

// //   return {
// //     nodes,
// //     edges
// //   };
// // }

// // enum RelationshipToTestType {
// //   Association,
// //   Generalization,
// //   AssociationProfile
// // }

// // const mapRelationshipTestTypeToSemanticCheck = {
// //   [RelationshipToTestType.Association]: isSemanticModelRelationship,
// //   [RelationshipToTestType.Generalization]: isSemanticModelGeneralization,
// //   [RelationshipToTestType.AssociationProfile]: isSemanticModelRelationshipProfile,
// // }


// // /**
// //  * Creates 3 models, each containing 4 classes.
// //  * 1st one has no relationships,
// //  * 2nd forms square
// //  * 3rd fully connected graph
// //  */
// // const prepareModelsWithSemanticData = (
// //   relationshipToTestType: RelationshipToTestType,
// //   profileOf: string[] | null,
// // ) => {
// //   const visualModel: WritableVisualModel = createDefaultVisualModelFactory().createNewWritableVisualModelSync();
// //   const modelIdentifier = "TEST-MODEL";
// //   const modelAlias = "TEST MODEL";
// //   const models : Map<string, EntityModel> = new Map();
// //   const modelCount = 3;
// //   const createdClasses: CreatedSemanticEntityData[][] = [];
// //   const createdRelationships: CreatedSemanticEntityData[][] = [];

// //   const aggregator = new SemanticModelAggregator();
// //   aggregator.addModel(visualModel);
// //   const aggregatorView = aggregator.getView();
// //   aggregatorView.changeActiveVisualModel(visualModel.getIdentifier());
// //   const visualModels: Map<string, WritableVisualModel> = new Map(Object.entries({[visualModel.getIdentifier()]: visualModel}));

// //   const graph: ModelGraphContextType = {
// //     aggregator,
// //     aggregatorView,
// //     setAggregatorView: function (_value: SetStateAction<SemanticModelAggregatorView>): void {
// //       throw new Error("Function not implemented.");
// //     },
// //     models: models,
// //     setModels: function (_value: SetStateAction<Map<string, EntityModel>>): void {
// //       throw new Error("Function not implemented.");
// //     },
// //     visualModels,
// //     setVisualModels: function (_value: SetStateAction<Map<string, WritableVisualModel>>): void {
// //       throw new Error("Function not implemented.");
// //     }
// //   };
// //   for(let i = 0; i < modelCount; i++) {
// //     const model = new InMemorySemanticModel();
// //     model.setAlias(modelAlias);
// //     models.set(model.getId(), model);
// //     aggregator.addModel(model);
// //     createdClasses.push([]);
// //     createdRelationships.push([]);
// //   }

// //   // Fill with data
// //   const cmeModels = entityModelsMapToCmeVocabulary(models, visualModel);
// //   for(let i = 0; i < modelCount; i++) {
// //     for(let j = 0; j < 4; j++) {
// //       const createdClass = createSemanticClassTestVariant(models, `${i}-${j}`, cmeModels[i].dsIdentifier, []);
// //       if(createdClass === null) {
// //         fail("Failed on setup");
// //       }
// //       createdClasses[i].push(createdClass);
// //     }

// //     let squareRelationships;
// //     switch(i) {
// //       case 0:
// //         break;
// //       case 1:
// //         squareRelationships = createRelationshipSquare(
// //           models, cmeModels[i].dsIdentifier, createdClasses, i,
// //           relationshipToTestType, profileOf);
// //         createdRelationships[i].push(...squareRelationships);
// //         break;
// //       case 2:
// //         squareRelationships = createRelationshipSquare(
// //           models, cmeModels[i].dsIdentifier, createdClasses, i,
// //           relationshipToTestType, profileOf);
// //         createdRelationships[i].push(...squareRelationships);

// //         let createdDiagonalRelationship = createRelationshipToTest(
// //           models, cmeModels[i].dsIdentifier, relationshipToTestType,
// //           createdClasses[i][0].identifier, createdClasses[i][3].identifier, profileOf);
// //         createdRelationships[i].push(createdDiagonalRelationship);

// //         createdDiagonalRelationship = createRelationshipToTest(
// //           models, cmeModels[i].dsIdentifier, relationshipToTestType,
// //           createdClasses[i][1].identifier, createdClasses[i][2].identifier, profileOf);
// //         createdRelationships[i].push(createdDiagonalRelationship);
// //         break;
// //       default:
// //         fail("Failed on setup");
// //     }
// //   }

// //   const classesContext = createClassesContextTypeForTests(
// //     createdClasses.flat(),
// //     relationshipToTestType === RelationshipToTestType.Association ? createdRelationships.flat() : [],
// //     relationshipToTestType === RelationshipToTestType.Generalization ? createdRelationships.flat() : [],
// //     relationshipToTestType === RelationshipToTestType.AssociationProfile ? createdRelationships.flat() : [],
// //   );

// //   return {
// //     visualModel,
// //     modelIdentifier,
// //     modelAlias,
// //     models,
// //     cmeModels,
// //     graph,
// //     classesContext
// //   };
// // }

// // const createRelationshipSquare = (
// //   models: Map<string, EntityModel>,
// //   dsIdentifier: string,
// //   createdClasses: CreatedSemanticEntityData[][],
// //   currentModel: number,
// //   relationshipToTestType: RelationshipToTestType,
// //   profileOf: string[] | null,
// // ): CreatedSemanticEntityData[] => {
// //   const createdRelationships = [];
// //   for(let i = 0; i < 4; i++) {
// //     const created = createRelationshipToTest(
// //       models, dsIdentifier, relationshipToTestType,
// //       createdClasses[currentModel][i].identifier,
// //       createdClasses[currentModel][(i+1)%4].identifier, profileOf);
// //     createdRelationships.push(created);
// //   }

// //   return createdRelationships;
// // }

// // const createNewVisualNodeForTesting = (
// //   visualModel: WritableVisualModel,
// //   model: string,
// //   representedEntity: string,
// //   position?: XY
// // ) => {
// //   const visualId = visualModel.addVisualNode({
// //     representedEntity: representedEntity,
// //     model,
// //     content: [],
// //     visualModels: [],
// //     position: position !== undefined ? {...position, anchored: null} : { x: 0, y: 0, anchored: null },
// //   });

// //   return visualId;
// // }

// // // TODO RadStr: Zase vylepseny oproti filter-selection testu
// // const createNewVisualNodeOfClassProfileForTesting = (
// //   visualModel: WritableVisualModel,
// //   model: string,
// //   representedEntity: string,
// //   profiledClassVisualId: string,
// //   position?: XY
// // ) => {
// //   const profileVisualId = visualModel.addVisualNode({
// //     representedEntity: representedEntity,
// //     model,
// //     content: [],
// //     visualModels: [],
// //     position: position !== undefined ? {...position, anchored: null} : { x: 0, y: 0, anchored: null },
// //   });

// //   visualModel.addVisualProfileRelationship({
// //     model: "",
// //     waypoints: [],
// //     visualSource: profileVisualId,
// //     visualTarget: profiledClassVisualId,
// //     entity: ""
// //   })

// //   return profileVisualId;
// // }


// // let currentRepresentedRelationshipIdentifier = 0;
// // const createNewVisualRelationshipForTestingFromSemanticEnds = (
// //   visualModel: WritableVisualModel,
// //   model: string,
// //   source: string,
// //   target: string,
// //   representedRelationshipIdentifier?: string,
// // ) => {
// //   const visualSource = visualModel.getVisualEntitiesForRepresented(source)[0];
// //   const visualTarget = visualModel.getVisualEntitiesForRepresented(target)[0];
// //   if(visualSource === undefined || visualTarget === undefined || !isVisualNode(visualSource) || !isVisualNode(visualTarget)) {
// //     fail("Failed when creating visual relationship for testing - programmer error");
// //   }
// //   const visualId = visualModel.addVisualRelationship({
// //     model: model,
// //     representedRelationship: representedRelationshipIdentifier ?? `r-${currentRepresentedRelationshipIdentifier++}`,
// //     waypoints: [{
// //       x: 0, y: 2,
// //       anchored: null
// //     }],
// //     visualSource: visualSource.identifier,
// //     visualTarget: visualTarget.identifier,
// //   });

// //   return visualId;
// // }

// // function createSemanticRelationshipTestVariant(
// //   models: Map<string, EntityModel>,
// //   domain: string,
// //   range: string,
// //   modelDsIdentifier: string,
// //   relationshipName: string,
// // ): CreatedSemanticEntityData {
// //   const name = {"en": relationshipName};

// //   const operation = createRelationship({
// //     ends: [{
// //       iri: null,
// //       name: {},
// //       description: {},
// //       concept: domain,
// //       cardinality: [0, 1],
// //     }, {
// //       name,
// //       description: {},
// //       concept: range,
// //       cardinality: [0, 1],
// //       iri: generateIriForName(name["en"]),
// //     }]
// //   });

// //   const model: InMemorySemanticModel = models.get(modelDsIdentifier) as InMemorySemanticModel;
// //   const newAssociation = model.executeOperation(operation) as CreatedEntityOperationResult;

// //   // Perform additional modifications for which we need to have the class identifier.
// //   const operations = [];
// //   const specializations: Specialization[] = [];
// //   for (const specialization of specializations) {
// //     operations.push(createGeneralization({
// //       parent: specialization.specialized,
// //       child: newAssociation.id,
// //       iri: specialization.iri,
// //     }));
// //   }
// //   model.executeOperations(operations);

// //   return {
// //     identifier: newAssociation.id,
// //     model,
// //   };
// // }

// // /**
// //  * @param identifier if null, then unique identifier is created in the executeOperation
// //  */
// // function createSemanticGeneralizationTestVariant(
// //   parent: string,
// //   child: string,
// //   identifier: string | null,
// //   models: Map<string, EntityModel>,
// //   modelDsIdentifier: string,
// // ): CreatedSemanticEntityData {
// //   const generalization: SemanticModelGeneralization | Omit<SemanticModelGeneralization, "id"> = {
// //     id: identifier ?? undefined,
// //     iri: generateIriForName(""),
// //     type: [SEMANTIC_MODEL_GENERALIZATION],
// //     parent,
// //     child,
// //   };

// //   const model: InMemorySemanticModel = models.get(modelDsIdentifier) as InMemorySemanticModel;
// //   const createGeneralizationOperation = createGeneralization(generalization);
// //   const newGeneralization = model.executeOperation(createGeneralizationOperation) as CreatedEntityOperationResult;

// //   return {
// //     identifier: newGeneralization.id,
// //     model,
// //   };
// // }

// // const createClassProfileTestVariant = (
// //   models: Map<string, EntityModel>,
// //   modelDsIdentifier: string,
// //   profileOf: string[],
// // ) => {
// //   const model = models.get(modelDsIdentifier) as InMemorySemanticModel;
// //   const result = createCmeClassProfile({
// //     model: modelDsIdentifier,
// //     profileOf,
// //     iri: null,
// //     name: null,
// //     nameSource: null,
// //     description: null,
// //     descriptionSource: null,
// //     usageNote: null,
// //     usageNoteSource: null,
// //   }, [...models.values() as any]);
// //   return {
// //     identifier: result.identifier,
// //     model,
// //   };
// // }

// // const createClassProfileOfEveryClassTestVariant = (
// //   models: Map<string, EntityModel>,
// //   modelDsIdentifier: string,
// //   classesContext: ClassesContextType,
// // ) => {
// //   const createdIdentifiers: {
// //     profiledClass: string,
// //     classProfile: string
// //   }[] = [];
// //   const model = models.get(modelDsIdentifier) as InMemorySemanticModel;
// //   for(const entity of Object.values(model.getEntities())) {
// //     if(!isSemanticModelClass(entity) && !isSemanticModelClassProfile(entity)) {
// //       continue;
// //     }

// //     const result = createClassProfileTestVariant(models, modelDsIdentifier, [entity.id]);
// //     createdIdentifiers.push({
// //       classProfile: result?.identifier,
// //       profiledClass: entity.id
// //     });
// //   }


// //   const newClassProfiles = createdIdentifiers.map(created => model.getEntities()[created.classProfile] as SemanticModelClassProfile);
// //   classesContext.classProfiles = classesContext.classProfiles.concat(newClassProfiles);
// //   return {
// //     createdIdentifiers,
// //     model,
// //   };
// // }


// // const createRelationshipProfileTestVariant = (
// //   models: Map<string, EntityModel>,
// //   modelDsIdentifier: string,
// //   profileOf: string[],
// //   domain: string,
// //   range: string,
// // ): CreatedSemanticEntityData => {
// //   const model: InMemorySemanticModel = models.get(modelDsIdentifier) as InMemorySemanticModel;
// //   const result = createCmeRelationshipProfile({
// //     model: modelDsIdentifier,
// //     profileOf,
// //     iri: null,
// //     name: null,
// //     nameSource: null,
// //     description: null,
// //     descriptionSource: null,
// //     usageNote: null,
// //     usageNoteSource: null,
// //     //
// //     domain: domain,
// //     domainCardinality: null,
// //     range: range,
// //     rangeCardinality: null,
// //   }, [...models.values() as any]);
// //   return {
// //     identifier: result.identifier,
// //     model,
// //   };
// // }

// // const createRelationshipProfileOfEveryRelationshipTestVariant = (
// //   models: Map<string, EntityModel>,
// //   modelDsIdentifier: string,
// //   classesContext: ClassesContextType,
// // ) => {
// //   const createdIdentifiers = [];
// //   const model = models.get(modelDsIdentifier) as InMemorySemanticModel;
// //   for(const entity of Object.values(model.getEntities())) {
// //     if(!isSemanticModelRelationship(entity) && !isSemanticModelRelationshipProfile(entity)) {
// //       continue;
// //     }

// //     if(entity.ends[0].concept === null || entity.ends[1].concept === null) {
// //       fail("Failed on relationship profile setup")
// //     }
// //     const result = createRelationshipProfileTestVariant(
// //       models, modelDsIdentifier, [entity.id],
// //       entity.ends[0].concept, entity.ends[1].concept);
// //     createdIdentifiers.push(result?.identifier);
// //   }

// //   const newRelationshipProfiles = createdIdentifiers.map(identifier =>
// //                                    model.getEntities()[identifier] as SemanticModelRelationshipProfile);
// //   classesContext.relationshipProfiles = classesContext.relationshipProfiles.concat(newRelationshipProfiles);
// //   return {
// //     createdIdentifiers,
// //     model,
// //   };
// // }


// // function createRelationshipToTest(
// //   models: Map<string, EntityModel>,
// //   modelDsIdentifier: string,
// //   relationshipToTestType: RelationshipToTestType,
// //   domain: string,
// //   range: string,
// //   profileOf: string[] | null,
// // ): CreatedSemanticEntityData  {
// //   let result: CreatedSemanticEntityData ;
// //   if(relationshipToTestType === RelationshipToTestType.Generalization) {
// //     result = createSemanticGeneralizationTestVariant(
// //       range, domain, null, models, modelDsIdentifier);
// //   }
// //   else if(relationshipToTestType === RelationshipToTestType.Association) {
// //     result = createSemanticRelationshipTestVariant(
// //       models, domain, range, modelDsIdentifier, "");
// //   }
// //   else if(relationshipToTestType === RelationshipToTestType.AssociationProfile) {
// //     result = createRelationshipProfileTestVariant(
// //       models, modelDsIdentifier, profileOf ?? [], domain, range);
// //   }
// //   else {
// //     fail("Failed in setup when creating relationship");
// //   }

// //   return result;
// // }



// // function addTestRelationshipToVisualModel(
// //   graph: ModelGraphContextType,
// //   visualModel: WritableVisualModel,
// //   modelDsIdentifier: string,
// //   relationshipToTestType: RelationshipToTestType,
// //   relationshipIdentifier: string,
// //   visualSources: string[] | null,
// //   visualTargets: string[] | null,
// // ) {
// //   if(relationshipToTestType === RelationshipToTestType.Generalization) {
// //     addSemanticGeneralizationToVisualModelAction(
// //       noActionNotificationServiceWriter, graph, visualModel,
// //       relationshipIdentifier, modelDsIdentifier);   // TODO RadStr: Fix after merge
// //   }
// //   else if(relationshipToTestType === RelationshipToTestType.Association) {
// //     addSemanticRelationshipToVisualModelAction(
// //       noActionNotificationServiceWriter, graph, visualModel,
// //       relationshipIdentifier, modelDsIdentifier, visualSources, visualTargets);
// //   }
// //   else if(relationshipToTestType === RelationshipToTestType.AssociationProfile) {
// //     addSemanticRelationshipProfileToVisualModelAction(
// //       noActionNotificationServiceWriter, graph, visualModel,
// //       relationshipIdentifier, modelDsIdentifier, visualSources, visualTargets);
// //   }
// // }


// // const createTestDiagramForDimensionHandling = () => {
// //   const diagram: UseDiagramType = {
// //     areActionsReady: false,
// //     actions: function (): DiagramActions {
// //       const diagramActions: DiagramActions = {
// //         getGroups: function (): Group[] {
// //           throw new Error("Function not implemented.");
// //         },
// //         addGroups: function (_groups: GroupWithContent[], _hideAddedTopLevelGroups: boolean): void {
// //           throw new Error("Function not implemented.");
// //         },
// //         removeGroups: function (_groups: string[]): void {
// //           throw new Error("Function not implemented.");
// //         },
// //         setGroup: function (_group: Group, _content: string[]): void {
// //           throw new Error("Function not implemented.");
// //         },
// //         getGroupContent: function (_group: Group): string[] {
// //           throw new Error("Function not implemented.");
// //         },
// //         getNodes: function (): Node[] {
// //           throw new Error("Function not implemented.");
// //         },
// //         addNodes: function (_nodes: Node[]): void {
// //           throw new Error("Function not implemented.");
// //         },
// //         updateNodes: function (_nodes: Node[]): void {
// //           throw new Error("Function not implemented.");
// //         },
// //         updateNodesPosition: function (_nodes: { [identifier: string]: Position; }): void {
// //           throw new Error("Function not implemented.");
// //         },
// //         removeNodes: function (_identifiers: string[]): void {
// //           throw new Error("Function not implemented.");
// //         },
// //         getNodeWidth: function (_identifier: string): number | null {
// //           return 200;
// //         },
// //         getNodeHeight: function (_identifier: string): number | null {
// //           return 100;
// //         },
// //         getEdges: function (): Edge[] {
// //           throw new Error("Function not implemented.");
// //         },
// //         addEdges: function (_edges: Edge[]): void {
// //           throw new Error("Function not implemented.");
// //         },
// //         updateEdges: function (_edges: Edge[]): void {
// //           throw new Error("Function not implemented.");
// //         },
// //         setEdgesWaypointPosition: function (_positions: { [identifier: string]: Position[]; }): void {
// //           throw new Error("Function not implemented.");
// //         },
// //         removeEdges: function (_identifiers: string[]): void {
// //           throw new Error("Function not implemented.");
// //         },
// //         getSelectedNodes: function (): Node[] {
// //           throw new Error("Function not implemented.");
// //         },
// //         setSelectedNodes: function (_selectedNodes: string[]): void {
// //           throw new Error("Function not implemented.");
// //         },
// //         getSelectedEdges: function (): Edge[] {
// //           return [createTestDiagramEdge("edge0"), createTestDiagramEdge("edge1")];
// //         },
// //         setSelectedEdges: function (_edges: string[]): void {
// //           throw new Error("Function not implemented.");
// //         },
// //         setContent: function (_nodes: Node[], _edges: Edge[], _groups: GroupWithContent[]): Promise<void> {
// //           throw new Error("Function not implemented.");
// //         },
// //         getViewport: function (): ViewportDimensions {
// //           return {
// //             position: {x: 0, y: 0},
// //             width: 100,
// //             height: 100,
// //           };
// //         },
// //         setViewportToPosition: function (_x: number, _y: number): void {
// //           throw new Error("Function not implemented.");
// //         },
// //         centerViewportToNode: function (_identifier: string): void {
// //           throw new Error("Function not implemented.");
// //         },
// //         fitToView: function (_identifiers: string[]): void {
// //           throw new Error("Function not implemented.");
// //         },
// //         renderToSvgString: function (): Promise<string | null> {
// //           throw new Error("Function not implemented.");
// //         },
// //         openDragEdgeToCanvasMenu: function (_sourceNode: Node, _canvasPosition: Position): void {
// //           throw new Error("Function not implemented.");
// //         },
// //         openSelectionActionsMenu: function (_sourceNode: Node, _canvasPosition: Position): void {
// //           throw new Error("Function not implemented.");
// //         },
// //         openGroupMenu: function (_groupIdentifier: string, _canvasPosition: Position): void {
// //           throw new Error("Function not implemented.");
// //         },
// //         highlightNodesInExplorationModeFromCatalog: function (_nodeIdentifiers: string[], _modelOfClassWhichStartedHighlighting: string): void {
// //           throw new Error("Function not implemented.");
// //         }
// //       }

// //       return diagramActions;
// //     },
// //     setActions: function (_nextActions: DiagramActions): void {
// //       throw new Error("Function not implemented.");
// //     },
// //     callbacks: function (): DiagramCallbacks {
// //       throw new Error("Function not implemented.");
// //     },
// //     setCallbacks: function (_nextCallbacks: DiagramCallbacks): void {
// //       throw new Error("Function not implemented.");
// //     }
// //   };

// //   return diagram;
// // }
