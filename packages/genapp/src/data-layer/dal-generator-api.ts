import axios, { AxiosResponse } from "axios";
import { LayerArtifact } from "../engine/layer-artifact";

export default class DalApi {
    private readonly endpointBaseUri: string;
    private readonly dataSpecificationIri: string;

    constructor(baseUri: string) {
        this.endpointBaseUri = baseUri;
        this.dataSpecificationIri = "https://ofn.gov.cz/data-specification/c3e8d59e-cee7-482f-8ee6-5fa52a178ab8";
    }

    async generateDalLayerArtifact(dalGeneratorIdentifier: string, aggregateName: string): 
        Promise<AxiosResponse<Buffer, any>> {

        //const path = `/generators/${dalGeneratorIdentifier}/${aggregateName}`;
        //console.log(`Calling API: ${this.endpointBaseUri + path}`);
        //const promise = axios.get(this.endpointBaseUri + path);
        const promise = axios.get(`${this.endpointBaseUri}/generate?iri=${this.dataSpecificationIri}`, { responseType: "arraybuffer"});

        return promise;
    }

}