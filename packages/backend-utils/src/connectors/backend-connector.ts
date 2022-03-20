import {DataSpecification} from "@model-driven-data/core/data-specification/model";
import {DataSpecificationWithStores} from "../interfaces/data-specification-with-stores";
import {DataSpecificationWithMetadata} from "../interfaces/data-specification-with-metadata";
import {UpdateDataSpecification} from "../interfaces/update-data-specification";

/**
 * Handles the communication with the applications/backend package.
 */
export class BackendConnector {
  private readonly backendUrl: string;

  constructor(backendUrl: string) {
    this.backendUrl = backendUrl;
  }

  public async readDataSpecifications(): Promise<(DataSpecification & DataSpecificationWithStores & DataSpecificationWithMetadata)[]> {
    const data = await fetch(this.backendUrl + "/data-specification");
    return await data.json();
  }

  public async readDataSpecification(iri: string): Promise<(DataSpecification & DataSpecificationWithStores & DataSpecificationWithMetadata)|null> {
    const url = new URL(this.backendUrl + "/data-specification");
    url.searchParams.append("dataSpecificationIri", iri);
    const data = await fetch(url.toString());
    return await data.json();
  }

  public async createDataSpecification(): Promise<DataSpecification & DataSpecificationWithStores & DataSpecificationWithMetadata> {
    const data = await fetch(this.backendUrl + "/data-specification", {
      method: "POST",
    });
    return await data.json();
  }

  public async updateDataSpecification(dataSpecificationIri: string, update: UpdateDataSpecification): Promise<DataSpecification & DataSpecificationWithStores & DataSpecificationWithMetadata> {
    const data = await fetch(this.backendUrl + "/data-specification", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        dataSpecificationIri: dataSpecificationIri,
        update,
      }),
    });
    return await data.json();
  }

  public async deleteDataSpecification(dataSpecificationIri: string): Promise<void> {
    await fetch(this.backendUrl + "/data-specification", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        dataSpecificationIri: dataSpecificationIri,
      }),
    });
  }

  public async createDataStructure(dataSpecificationIri: string): Promise<{
    dataSpecification: DataSpecification & DataSpecificationWithMetadata & DataSpecificationWithStores,
    createdPsmSchemaIri: string,
  }> {
    const data = await fetch(this.backendUrl + "/data-specification/data-psm", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        dataSpecificationIri: dataSpecificationIri,
      }),
    });
    return await data.json();
  }

  public async deleteDataStructure(dataSpecificationIri: string, dataPsmSchemaIri: string): Promise<void> {
    await fetch(this.backendUrl + "/data-specification/data-psm", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        dataSpecificationIri,
        dataPsmSchemaIri,
      }),
    });
  }
}
