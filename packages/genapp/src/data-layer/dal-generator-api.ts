import axios, { AxiosResponse, HttpStatusCode } from "axios";
import { DataSpecification } from "@dataspecer/core/data-specification/model/data-specification";
import { DataPsmSchema } from "@dataspecer/core/data-psm/model/data-psm-schema";
import { CoreResource } from "@dataspecer/core/core/core-resource";

type ResourceMap<TResource extends CoreResource> = {
    [resourceIri: string]: TResource
}

export default class DalApi {
    private readonly endpointBaseUri: string;

    constructor() {
        this.endpointBaseUri = process.env.APP_BACKEND ?? "http://localhost:3100";
    }

    async generateDalLayerArtifact(dataSpecificationIri: string):
        Promise<AxiosResponse<Buffer, any>> {

        const promise = axios.get(
            `${this.endpointBaseUri}/generate?iri=${dataSpecificationIri}`,
            { responseType: "arraybuffer" }
        );

        return promise;
    }

    async getDataSpecification(dataSpecificationIri: string): Promise<DataSpecification> {
        const response = await axios.get<DataSpecification>(`${this.endpointBaseUri}/data-specification?dataSpecificationIri=${dataSpecificationIri}`);

        const dataSpecficiationModel = response.data;

        if (!dataSpecficiationModel) {
            throw new Error("Invalid data specification received");
        }

        return dataSpecficiationModel;
    }

    async getResource(resourceIri: string) {
        const resourceResponse = await axios.get(`${this.endpointBaseUri}/resources/blob?iri=${encodeURIComponent(resourceIri)}`);

        if (resourceResponse.status !== HttpStatusCode.Ok) {
            console.error(resourceResponse);
            throw new Error(`Error fetching data for: ${resourceIri}:`);
        }

        return resourceResponse.data.resources;
    }

    async getStructureInfo(dataSpecificationIri: string, structureIri: string): Promise<DataPsmSchema> {

        const specificationModel = await this.getDataSpecification(dataSpecificationIri);

        if (!specificationModel.psms.includes(structureIri)) {
            throw new Error(`Selected data specification does not contain data structure: ${structureIri}`);
        }

        const resourceResponse = await this.getResource(structureIri);

        const psmResourceMap = resourceResponse as ResourceMap<DataPsmSchema>;
        const dataStructure = psmResourceMap[structureIri];

        if (!dataStructure) {
            throw new Error(`${structureIri} does not reference any valid data structure`);
        }

        return dataStructure;
    }
}
