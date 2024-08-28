import axios, { AxiosResponse, HttpStatusCode } from "axios";
import { DataSpecification } from "@dataspecer/core/data-specification/model/data-specification";
import {Resource} from "@dataspecer/federated-observable-store/resource";
import { DataPsmSchema } from "@dataspecer/core/data-psm/model/data-psm-schema";
import { CoreResourceReader } from "@dataspecer/core/core/core-reader";
import { CoreResource } from "@dataspecer/core/core/core-resource";

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

    async getDataSpecification(): Promise<DataSpecification> {
        const response = await axios.get<DataSpecification>(`${this.endpointBaseUri}/data-specification?dataSpecificationIri=${this.dataSpecificationIri}`);

        const dataSpecficiationModel = response.data;

        if (!dataSpecficiationModel) {
            throw new Error("Invalid data specification received");
        }

        return dataSpecficiationModel;
    }

    async getStructureInfo(structureIri: string): Promise<DataPsmSchema> {

        // const specificationModel = await this.getDataSpecification();

        // if (!specificationModel.psms.includes(structureIri)) {
        //     throw new Error(`Selected data specification does not contain data structure: ${structureIri}`);
        // }

        const response = await axios
            .get(`${this.endpointBaseUri}/resources/blob?iri=${encodeURIComponent(structureIri)}`);

        if (response.status !== HttpStatusCode.Ok) {
            console.error(response);
            throw new Error(`Error fetching data with PIM IRI ${structureIri}:`);
        }

        const psmResourceMap = response.data().resources as ResourceMap<DataPsmSchema>;

        const dataStructure = psmResourceMap[structureIri];

        if (!dataStructure) {
            throw new Error(`${structureIri} does not reference any valid data structure`);
        }

        return dataStructure;
    }
}

type ResourceMap<TResource extends CoreResource> = {
    [resourceIri: string]: TResource
}