import axios, { AxiosResponse, HttpStatusCode } from "axios";

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

    async getStructureInfo(structureIri: string) {

        
        console.log("BACKEND: ", process.env.APP_BACKEND);
        const pimStructure = await axios
            .get(`${this.endpointBaseUri}/resources/blob?iri=${encodeURIComponent(structureIri)}`);

        if (pimStructure.status !== HttpStatusCode.Ok) {
            console.error(pimStructure);
            throw new Error(`Error fetching data with PIM IRI ${structureIri}:`);
        }

        return pimStructure.data().json();
        
        // const result = await fetch()
        //     .then(response => response.json())
        //     .catch(error => {
        //         console.error(`Error fetching data with PIM IRI ${structureIri}:`, error);
        //     });
    }
}