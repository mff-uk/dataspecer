import {Operation} from "../../platform-model-operations";
import {Store} from "../../platform-model-store";
import {updatePsmInterpretation} from "./atomic-operations";

interface UpdateAttributeInterpretationParameters {
    /** PSM attribute id */
    id: string;

    /** New PIM attribute to be interpreted */
    interpretation: string;
}

export class UpdateAttributeInterpretation implements Operation<UpdateAttributeInterpretationParameters> {
  canExecute(store: Store, parameters: UpdateAttributeInterpretationParameters): boolean {
    return true; // todo fix
  }

  execute(store: Store, parameters: UpdateAttributeInterpretationParameters): Store {
    return updatePsmInterpretation(store, parameters);
  }
}