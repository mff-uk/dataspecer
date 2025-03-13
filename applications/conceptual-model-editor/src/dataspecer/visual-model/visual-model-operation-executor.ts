import { WritableVisualModel } from "@dataspecer/core-v2/visual-model";
import { EntityDsIdentifier, EntityReference, ModelDsIdentifier } from "../entity-model";
import { addVisualNodeProfile } from "./operation/add-visual-node-profile";
import { addVisualNode } from "./operation/add-visual-node";
import { deleteEntityModel } from "./operation/delete-entity-model";
import { updateVisualNodeProfiles } from "./operation/update-visual-node-profiles";
import { addVisualRelationships } from "./operation/add-visual-relationships";

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
  addProfile(
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

  addProfile(
    profile: EntityReference,
    profiled: EntityReference,
  ): void {
    addVisualNodeProfile(this.visualModel, profile, profiled);
  }

  addNode(
    represented: EntityReference,
    position: { x: number, y: number },
    content: string[],
  ): void {
    addVisualNode(this.visualModel,
      { id: represented.identifier }, represented.model, position, content);
  }

  addRelationship(
    represented: EntityReference,
    source: EntityDsIdentifier,
    target: EntityDsIdentifier,
  ): void {
    addVisualRelationships(this.visualModel,
      represented.model, represented.identifier, [source], [target]);
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

export function createVisualModelOperationExecutor(
  visualModel: WritableVisualModel,
) {
  return new DefaultVisualModelOperationExecutor(visualModel);
}
