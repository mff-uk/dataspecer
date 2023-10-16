import {DataSpecification} from "@dataspecer/core/data-specification/model";
import {DataSpecificationWithStores} from "../interfaces/data-specification-with-stores";
import {DataSpecificationWithMetadata} from "../interfaces/data-specification-with-metadata";
import {UpdateDataSpecification} from "../interfaces/update-data-specification";
import {HttpFetch} from "@dataspecer/core/io/fetch/fetch-api";
import { CoreResource } from "@dataspecer/core/core";

/**
 * Handles the communication with the applications/backend package.
 */
export class BackendConnector {
  private readonly backendUrl: string;
  protected readonly httpFetch: HttpFetch;

  constructor(backendUrl: string, httpFetch: HttpFetch) {
    this.backendUrl = backendUrl;
    this.httpFetch = httpFetch;
  }

  public async readDefaultConfiguration(): Promise<object> {
    const data = await this.httpFetch(this.backendUrl + "/default-configuration");
    return await data.json() as object;
  }

  public async readDataSpecifications() {
    const data = await this.httpFetch(this.backendUrl + "/data-specification");
    return await data.json() as (DataSpecification & DataSpecificationWithStores & DataSpecificationWithMetadata)[];
  }

  public async readDataSpecification(iri: string) {
    const url = new URL(this.backendUrl + "/data-specification");
    url.searchParams.append("dataSpecificationIri", iri);
    const data = await this.httpFetch(url.toString());
    return await data.json() as (DataSpecification & DataSpecificationWithStores & DataSpecificationWithMetadata)|null;
  }

  public async doGarbageCollection(dataSpecificationIri: string): Promise<object | false> {
    const data = await fetch(this.backendUrl + "/data-specification/garbage-collection", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        dataSpecificationIri: dataSpecificationIri,
      }),
    });

    if (data.status !== 200) {
      throw new Error("Garbage collection failed");
    }

    return await data.json() as object;
  }

  public async createDataSpecification(set: UpdateDataSpecification = {}): Promise<DataSpecification & DataSpecificationWithStores & DataSpecificationWithMetadata> {
    const data = await fetch(this.backendUrl + "/data-specification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(set),
    });
    return await data.json();
  }

  public async cloneDataSpecification(dataSpecificationIri: string, set: UpdateDataSpecification = {}): Promise<DataSpecification & DataSpecificationWithStores & DataSpecificationWithMetadata> {
    const data = await fetch(this.backendUrl + "/data-specification/clone", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        dataSpecificationIri: dataSpecificationIri,
        set,
      }),
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

  public async importSpecifications(dataSpecifications: Record<string, object>, specificationsToImport: Record<string, string>, store: Record<string, CoreResource>): Promise<void> {
    await fetch(this.backendUrl + "/import", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        dataSpecifications,
        specificationsToImport,
        store,
      }),
    });
  }
}
