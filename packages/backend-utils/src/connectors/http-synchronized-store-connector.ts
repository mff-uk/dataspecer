import {CoreOperation, CoreResource} from "@model-driven-data/core/core";

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

  constructor(backendUrl: string) {
    this.backendUrl = backendUrl;
  }

  public async load(): Promise<StoreData>{
    const fetchData = await fetch(this.backendUrl, {method: 'GET', headers});
    return await fetchData.json();
  }

  public async save(storeData: StoreData): Promise<void> {
    const body = JSON.stringify(storeData);
    await fetch(this.backendUrl, {method: 'PUT', headers, body});
  }
}
