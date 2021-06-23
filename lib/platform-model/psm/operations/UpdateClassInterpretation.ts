import {Operation} from "../../platform-model-operations";
import {Store} from "../../platform-model-store";
import {updatePsmInterpretation} from "./atomic-operations";

interface UpdateClassInterpretationParameters {
    /** PSM class id */
    id: string;

    /** New PIM class to be interpreted */
    interpretation: string;
}

export class UpdateClassInterpretation implements Operation<UpdateClassInterpretationParameters> {
  canExecute(store: Store, parameters: UpdateClassInterpretationParameters): boolean {
    return true; // todo implement
  }

  execute(store: Store, parameters: UpdateClassInterpretationParameters): Store {
    return updatePsmInterpretation(store, parameters);
  }

}