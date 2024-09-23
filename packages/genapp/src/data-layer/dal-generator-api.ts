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
        this.endpointBaseUri = process.env.APP_BACKEND ?? "";
    }

    async generateDalLayerArtifact(dataSpecificationIri: string):
        Promise<AxiosResponse<Buffer, any>> {

        const url = `${this.endpointBaseUri}/generate?iri=${dataSpecificationIri}`;
        console.log("URL", url);
        const promise = axios.get(
            url,
            { responseType: "arraybuffer" }
        );

        return promise;
    }

    async getDataSpecification(dataSpecificationIri: string): Promise<DataSpecification> {

        const url = `${this.endpointBaseUri}/data-specification?dataSpecificationIri=${dataSpecificationIri}`;
        console.log("URL", url);
        const response = await axios.get<DataSpecification>(url);

        const dataSpecficiationModel = response.data;

        if (!dataSpecficiationModel) {
            throw new Error("Invalid data specification received");
        }

        return dataSpecficiationModel;
    }

    async getResource(resourceIri: string) {
        const url = `${this.endpointBaseUri}/resources/blob?iri=${encodeURIComponent(resourceIri)}`;
        console.log("URL", url);
        const resourceResponse = await axios.get(url);

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
