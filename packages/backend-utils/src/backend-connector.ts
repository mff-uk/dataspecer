/**
 * Handles the communication with the applications/backend package.
 */
import {DataSpecification} from "@model-driven-data/core/data-specification/model";
import {LanguageString} from "@model-driven-data/core/core";

export class BackendConnector {
  private backendUrl: string;

  constructor(backendUrl: string) {
    this.backendUrl = backendUrl;
  }

  public async fetchAllDataSpecifications(): Promise<DataSpecification[]> {
    throw new Error("Method not implemented.");
  }

  public async createDataSpecification(): Promise<DataSpecification> {
    throw new Error("Method not implemented.");
  }

  public async updateDataSpecificationLabels(iri: string, label: LanguageString, description: LanguageString): Promise<DataSpecification> {
    throw new Error("Method not implemented.");
  }

  public async updateDataSpecification(specification: DataSpecification): Promise<DataSpecification> {
    throw new Error("Method not implemented.");
  }

  public async deleteDataSpecification(iri: string): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
}
