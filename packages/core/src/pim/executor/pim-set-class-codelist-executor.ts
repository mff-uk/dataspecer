import {
  CoreResourceReader,
  CoreExecutorResult,
  CreateNewIdentifier,
  CoreResource,
} from "../../core";
import {PimSetClassCodelist} from "../operation";
import {PimClass} from "../model";

export async function executePimSetClassCodelist(
  reader: CoreResourceReader,
  createNewIdentifier: CreateNewIdentifier,
  operation: PimSetClassCodelist,
): Promise<CoreExecutorResult> {

  const resource = await reader.readResource(operation.pimClass);
  if (!PimClass.is(resource)) {
    return CoreExecutorResult.createError(
      `Invalid pim class resource '${operation.pimClass}'.`);
  }

  return CoreExecutorResult.createSuccess([], [{
    ...resource,
    "pimIsCodelist": operation.pimIsCodeList,
    "pimCodelistUrl": operation.pimCodelistUrl,
  } as CoreResource]);
}
