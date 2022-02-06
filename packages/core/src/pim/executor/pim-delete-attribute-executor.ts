import {
  CoreResourceReader,
  CoreExecutorResult,
  CreateNewIdentifier,
  CoreResource,
} from "../../core";
import { PimExecutorResultFactory, loadPimSchema } from "./pim-executor-utils";
import { PimDeleteAttribute } from "../operation";

export async function executePimDeleteAttribute(
  reader: CoreResourceReader,
  createNewIdentifier: CreateNewIdentifier,
  operation: PimDeleteAttribute
): Promise<CoreExecutorResult> {
  const schema = await loadPimSchema(reader);
  if (schema === null) {
    return PimExecutorResultFactory.missingSchema();
  }

  return CoreExecutorResult.createSuccess(
    [],
    [
      {
        ...schema,
        pimParts: schema.pimParts.filter(
          (iri) => iri !== operation.pimAttribute
        ),
      } as CoreResource,
    ],
    [operation.pimAttribute]
  );
}
