import { CoreOperation, CoreResource } from "../../core";
import * as PSM from "../data-psm-vocabulary";

/**
 * Moves property (association, attribute or include) to another container.
 *
 * De facto can be used instead of DataPsmSetOrder, although this has different semantics.
 *
 * todo: Is PSM tree really a tree?
 */
export class DataPsmMoveProperty extends CoreOperation {
  static readonly TYPE = PSM.MOVE_PROPERTY;

  /**
   * The container we are moving the property from.
   */
  dataPsmSourceContainer: string | null = null;

  /**
   * DataPsmAttribute or DataPsmAssociation
   */
  dataPsmProperty: string | null = null;

  /**
   * DataPsmClass or container to move the property to.
   */
  dataPsmTargetContainer: string | null = null;

  /**
   * Set null to move to the first position.
   */
  dataPsmMoveAfter: string | null = null;

  constructor() {
    super();
    this.types.push(DataPsmMoveProperty.TYPE);
  }

  static is(resource: CoreResource | null): resource is DataPsmMoveProperty {
    return resource?.types.includes(DataPsmMoveProperty.TYPE);
  }
}
