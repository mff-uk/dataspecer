import axios, { AxiosResponse } from "axios";
import { LayerArtifact } from "../engine/layer-artifact";

export default class DalApi {
    private readonly endpointBaseUri: string;

    constructor(baseUri: string) {
        this.endpointBaseUri = baseUri;
    }

    async generateDalLayerArtifact(dalGeneratorIdentifier: string, aggregateName: string): 
        Promise<AxiosResponse<LayerArtifact, any>> {

        const path = `/generators/${dalGeneratorIdentifier}/${aggregateName}`;
        console.log(`Calling API: ${this.endpointBaseUri + path}`);
        const promise = axios.get(this.endpointBaseUri + path);

        return promise;
    }

}