import {CoreOperation, CoreResource} from "@dataspecer/core/core";
import {HttpFetch} from "@dataspecer/core/io/fetch/fetch-api";

type StoreData = {
  operations: CoreOperation[];
  resources: {[resourceIri: string]: CoreResource}
};

const headers = {
  'Accept': 'application/json',
  'Content-Type': 'application/json'
};

export class HttpSynchronizedStoreConnector {
  private readonly backendUrl: string;
  protected readonly httpFetch: HttpFetch;

  constructor(backendUrl: string, httpFetch: HttpFetch) {
    this.backendUrl = backendUrl;
    this.httpFetch = httpFetch;
  }

  public async load() {
    const fetchData = await this.httpFetch(this.backendUrl, {method: 'GET', headers});
    return await fetchData.json() as StoreData;
  }

  public async save(storeData: StoreData) {
    const body = JSON.stringify(storeData);
    await this.httpFetch(this.backendUrl, {method: 'PUT', headers, body});
  }
}
