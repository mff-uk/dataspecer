import {
  CoreModelReader,
  CoreModelWriter,
  ModelChange,
  CoreOperation,
  CoreResource,
  CreateNewIdentifier,
} from "../../../core";
import {asDataPsmCreateSchema, isDataPsmCreateSchema} from "../../operation";
import {assert, assertNot} from "../../../io/assert";
import {executeDataPsmOperation} from "../../executor";

export class DataPsmMemoryStore implements CoreModelReader, CoreModelWriter {

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

  async readResource(iri: string): Promise<CoreResource> {
    // TODO: We may need to create a deep copy here.
    return this.resources[iri];
  }

  async applyOperation(operation: CoreOperation): Promise<ModelChange> {
    if (this.operations.length === 0) {
      this.applyFirstOperation(operation);
    }
    const operationResult = await executeDataPsmOperation(
      this.createNewIdentifier, this, operation);
    if (operationResult.failed) {
      throw new Error("Operation failed: " + operationResult.message);
    }

    const resultOperation = this.addOperation(operation);
    this.resources = {...this.resources, ...operationResult.changedResources};
    operationResult.deletedResource
      .forEach((iri) => delete this.resources[iri]);

    return {
      "operation": resultOperation,
      "changed": Object.keys(operationResult.changedResources),
      "deleted": operationResult.deletedResource,
    };
  }

  protected applyFirstOperation(operation: CoreOperation) {
    assert(
      isDataPsmCreateSchema(operation),
      "The first operation must create a schema.");
    const pimCreateSchema = asDataPsmCreateSchema(operation);
    assertNot(
      pimCreateSchema.dataPsmBaseIri === undefined,
      "The create schema action must have base IRI defined.");
    this.baseIri = pimCreateSchema.dataPsmBaseIri;
  }

  protected addOperation<T extends CoreOperation>(operation: T): T {
    // TODO Replace with deep clone.
    const result = {...operation} as T;
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
