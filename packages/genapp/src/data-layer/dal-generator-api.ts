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
        this.endpointBaseUri = process.env.APP_BACKEND!; //|| "http://localhost:8889";
    }

    async generateDalLayerArtifact(dataSpecificationIri: string):
        Promise<AxiosResponse<Buffer, any>> {

        const promise = axios.get(
            `${this.endpointBaseUri}/generate?iri=${dataSpecificationIri}`,
            { responseType: "arraybuffer" }
        );

        return promise;
    }

    private async getDataSpecification(dataSpecificationIri: string): Promise<DataSpecification> {
        const response = await axios.get<DataSpecification>(`${this.endpointBaseUri}/data-specification?dataSpecificationIri=${dataSpecificationIri}`);

        const dataSpecficiationModel = response.data;

        if (!dataSpecficiationModel) {
            throw new Error("Invalid data specification received");
        }

        return dataSpecficiationModel;
    }

    async getStructureInfo(dataSpecificationIri: string, structureIri: string): Promise<DataPsmSchema> {

        const specificationModel = await this.getDataSpecification(dataSpecificationIri);

        if (!specificationModel.psms.includes(structureIri)) {
            throw new Error(`Selected data specification does not contain data structure: ${structureIri}`);
        }

        const response = await axios
            .get(`${this.endpointBaseUri}/resources/blob?iri=${encodeURIComponent(structureIri)}`);

        if (response.status !== HttpStatusCode.Ok) {
            console.error(response);
            throw new Error(`Error fetching data with PIM IRI ${structureIri}:`);
        }

        const psmResourceMap = response.data.resources as ResourceMap<DataPsmSchema>;
        const dataStructure = psmResourceMap[structureIri];

        if (!dataStructure) {
            throw new Error(`${structureIri} does not reference any valid data structure`);
        }

        return dataStructure;
    }
}
