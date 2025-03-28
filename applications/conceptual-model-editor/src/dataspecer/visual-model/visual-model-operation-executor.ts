import { VisualEntity, VisualModel, WritableVisualModel } from "@dataspecer/core-v2/visual-model";
import { EntityDsIdentifier, EntityReference, ModelDsIdentifier } from "../entity-model";
import { addVisualNodeProfile } from "./operation/add-visual-node-profile";
import { addVisualNode } from "./operation/add-visual-node";
import { deleteEntityModel } from "./operation/delete-entity-model";
import { updateVisualNodeProfiles } from "./operation/update-visual-node-profiles";
import { addVisualRelationships, addVisualRelationshipsWithSpecifiedVisualEnds } from "./operation/add-visual-relationships";

export interface VisualModelOperationExecutor {

  /**
   * @throws DataspecerError
   */
  addGeneralization(
    represented: EntityReference,
    child: EntityDsIdentifier,
    parent: EntityDsIdentifier,
  ): void;

  /**
   * @throws DataspecerError
   */
  addGeneralizationWithSpecifiedVisualEnds(
    represented: EntityReference,
    visualSources: EntityDsIdentifier[],
    visualTargets: EntityDsIdentifier[],
  ): void;

  /**
   * @throws DataspecerError
   */
  addProfile(
    profile: EntityReference,
    profiled: EntityReference,
  ): void;

  /**
   * Try to perform {@link addProfile} operation, but ignore failure.
   */
  tryAddProfile(
    profile: EntityReference,
    profiled: EntityReference,
  ): void;

  /**
   * @throws DataspecerError
   */
  addNode(
    represented: EntityReference,
    position: { x: number, y: number },
    content: string[],
  ): void;

  /**
   * @throws DataspecerError
   */
  addRelationship(
    represented: EntityReference,
    source: EntityDsIdentifier,
    target: EntityDsIdentifier,
  ): void;

  /**
   * @throws DataspecerError
   */
  addRelationshipWithSpecifiedVisualEnds(
    represented: EntityReference,
    visualSources: EntityDsIdentifier[],
    visualTargets: EntityDsIdentifier[],
  ): void;

  /**
    @param represented The profiled entity.
   * @throws DataspecerError
   */
  updateProfile(
    represented: EntityReference,
    previous: EntityReference[],
    next: EntityReference[],
  ): void;

  /**
   * @throws DataspecerError
   */
  deleteModel(model: ModelDsIdentifier): void;

}

class DefaultVisualModelOperationExecutor
implements VisualModelOperationExecutor {

  private visualModel: WritableVisualModel;

  constructor(visualModel: WritableVisualModel) {
    this.visualModel = visualModel;
  }

  addGeneralization(
    represented: EntityReference,
    child: EntityDsIdentifier,
    parent: EntityDsIdentifier,
  ): void {
    addVisualRelationships(this.visualModel,
      represented.model, represented.identifier, child, parent);
  }

  addGeneralizationWithSpecifiedVisualEnds(
    represented: EntityReference,
    visualChildren: EntityDsIdentifier[],
    visualParents: EntityDsIdentifier[]
  ): void {
    const visualSources = convertIdentifiersToVisualEntities(this.visualModel, visualChildren);
    const visualTargets = convertIdentifiersToVisualEntities(this.visualModel, visualParents);
    addVisualRelationshipsWithSpecifiedVisualEnds(this.visualModel,
      represented.model, represented.identifier, visualSources, visualTargets);
  }

  addProfile(
    profile: EntityReference,
    profiled: EntityReference,
  ): void {
    addVisualNodeProfile(this.visualModel, profile, profiled);
  }

  tryAddProfile(
    profile: EntityReference,
    profiled: EntityReference,
  ): void {
    try {
      addVisualNodeProfile(this.visualModel, profile, profiled);
    } catch {
      // We do nothing as it is just a try.
    }
  }

  addNode(
    represented: EntityReference,
    position: { x: number, y: number },
    content: string[],
  ): void {
    addVisualNode(this.visualModel,
      { id: represented.identifier }, represented.model, position, content);
  }

  addRelationshipWithSpecifiedVisualEnds(
    represented: EntityReference,
    visualSourcesIdentifiers: EntityDsIdentifier[],
    visualTargetsIdentifiers: EntityDsIdentifier[]
  ): void {
    const visualSources = convertIdentifiersToVisualEntities(this.visualModel, visualSourcesIdentifiers);
    const visualTargets = convertIdentifiersToVisualEntities(this.visualModel, visualTargetsIdentifiers);
    addVisualRelationshipsWithSpecifiedVisualEnds(this.visualModel,
      represented.model, represented.identifier, visualSources, visualTargets);
  }

  addRelationship(
    represented: EntityReference,
    source: EntityDsIdentifier,
    target: EntityDsIdentifier,
  ): void {
    addVisualRelationships(this.visualModel,
      represented.model, represented.identifier, source, target);
  }

  updateProfile(
    represented: EntityReference,
    previous: EntityReference[],
    next: EntityReference[],
  ): void {
    updateVisualNodeProfiles(this.visualModel, represented, previous, next);
  }

  deleteModel(model: ModelDsIdentifier): void {
    deleteEntityModel(this.visualModel, model);
  }

}

function convertIdentifiersToVisualEntities(
  visualModel: VisualModel,
  identifiers: string[]
): VisualEntity[] {
  const visualEntities = identifiers
    .map(identifier => visualModel.getVisualEntity(identifier))
    .filter(entity => entity !== null);
  return visualEntities;
}

export function createVisualModelOperationExecutor(
  visualModel: WritableVisualModel,
) {
  return new DefaultVisualModelOperationExecutor(visualModel);
}
