import {CoreModelReader, CoreModelWriter, ModelChange} from "../../../core/api";
import {CoreOperation, CoreResource} from "../../../core/";
import {PimResource, PimResourceMap} from "../../model";
import {asPimCreateSchema, isPimCreateSchema} from "../../operation";
import {assert, assertNot} from "../../../io/assert";
import {CreateNewIdentifier, applyPimOperation} from "../../executor";

export class PimMemoryStore implements CoreModelReader, CoreModelWriter {

  private operations: CoreOperation[] = [];

  private resources: PimResourceMap = {};

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
    const changedResources = await applyPimOperation(
      this.createNewIdentifier, this, operation);
    const resultOperation = this.addOperation(operation);
    this.resources = {...this.resources, ...changedResources};
    return {
      "operation": resultOperation,
      "changed": Object.keys(changedResources),
    };
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
    // TODO Replace with deep clone.
    const result = {...operation} as T;
    assertNot(this.baseIri === undefined, "Base IRI is not defined.")
    result.iri = this.baseIri + "/operation/" + this.createUniqueIdentifier();
    this.operations.push(result);
    return result;
  }

  protected createUniqueIdentifier() {
    return 'xxxx-xxxx-yxxx'.replace(/[xy]/g, function (pattern) {
      let code = Math.random() * 16 | 0;
      let result = pattern == 'x' ? code : (code & 0x3 | 0x8);
      return Date.now() + result.toString(16);
    });
  }

}
