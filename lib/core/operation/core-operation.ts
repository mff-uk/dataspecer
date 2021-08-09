import {CoreResource} from "../core-resource";

/**
 * Operation can be applied to change data model. Any data model, like
 * data-psm or platform-independent-model, must change only using operations.
 * This provide us with possibility to implement time travel and synchronization
 * of multiple models.
 */
export interface CoreOperation extends CoreResource {

  parent?: string;

}
