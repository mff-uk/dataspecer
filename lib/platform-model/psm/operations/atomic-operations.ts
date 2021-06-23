import {PsmBase} from "../psm-base";
import {Store} from "../../platform-model-store";

/**
 * Updates an interpretation of PsmBase element. Performs no checks.
 */
export function updatePsmInterpretation(store: Store, parameters: {id: string, interpretation: string}): Store {
  const {id, interpretation} = parameters;
  const cls = <PsmBase>{...store[id]};
  cls.psmInterpretation = interpretation;
  return {...store, [id]: cls};
}
