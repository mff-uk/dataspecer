import {
  CoreResourceReader,
  CoreResourceWriter,
  CoreOperationResult,
  CoreOperation,
  CoreResource,
  CreateNewIdentifier,
  assert, assertNot, clone,
} from "../../../core";
import {asPimCreateSchema, isPimCreateSchema} from "../../operation";
import {executePimOperation} from "../../executor";

export class PimMemoryStore
  implements CoreResourceReader, CoreResourceWriter {

  private operations: CoreOperation[] = [];

  private resources: { [iri: string]: CoreResource } = {};

  private baseIri: string;

  private readonly createNewIdentifier: CreateNewIdentifier;

  constructor() {
    this.createNewIdentifier = (name) => {
      return this.baseIri + "/" + name + "/" + this.createUniqueIdentifier();
    };
  }

  async listResources(): Promise<string[]> {
    return Object.keys(this.resources);
  }

  listResourcesOfType(typeIri: string): Promise<string[]> {
    const result: string[] = [];
    for (const [iri, resource] of Object.entries(this.resources)) {
      if (resource.types.includes(typeIri)) {
        result.push(iri);
      }
    }
    return Promise.resolve(result);
  }

  async readResource(iri: string): Promise<CoreResource> {
    // TODO: We may need to create a deep copy here.
    return this.resources[iri];
  }

  async applyOperation(operation: CoreOperation): Promise<CoreOperationResult> {
    if (this.operations.length === 0) {
      this.applyFirstOperation(operation);
    }
    const operationResult = await executePimOperation(
      this.createNewIdentifier, this, operation);
    if (operationResult.failed) {
      throw new Error("Operation failed: " + operationResult.message);
    }

    const storedOperation = this.addOperation(operation);
    this.resources = {
      ...this.resources,
      ...operationResult.changed,
      ...operationResult.created,
    };
    operationResult.deleted.forEach((iri) => delete this.resources[iri]);
    operationResult.operationResult.operation = storedOperation;
    return operationResult.operationResult;
  }

  protected applyFirstOperation(operation: CoreOperation) {
    assert(
      isPimCreateSchema(operation),
      "The first operation must create a schema.");
    const pimCreateSchema = asPimCreateSchema(operation);
    assertNot(
      pimCreateSchema.pimBaseIri === undefined,
      "The create schema action must have base IRI defined.");
    this.baseIri = pimCreateSchema.pimBaseIri;
  }

  protected addOperation<T extends CoreOperation>(operation: T): T {
    const result = clone(operation);
    assertNot(this.baseIri === undefined, "Base IRI is not defined.");
    result.iri = this.baseIri + "/operation/" + this.createUniqueIdentifier();
    this.operations.push(result);
    return result;
  }

  protected createUniqueIdentifier() {
    return "xxxx-xxxx-yxxx".replace(/[xy]/g, function (pattern) {
      const code = Math.random() * 16 | 0;
      const result = pattern == "x" ? code : (code & 0x3 | 0x8);
      return Date.now() + result.toString(16);
    });
  }

}
