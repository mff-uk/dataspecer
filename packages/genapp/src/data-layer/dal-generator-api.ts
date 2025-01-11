import axios, { AxiosResponse, HttpStatusCode } from "axios";
import { DataSpecification } from "@dataspecer/core/data-specification/model/data-specification";
import { DataPsmSchema } from "@dataspecer/core/data-psm/model/data-psm-schema";
import { CoreResource } from "@dataspecer/core/core/core-resource";
import { GenappEnvConfig } from "../engine/generator-env-config";

type ResourceMap<TResource extends CoreResource> = {
    [resourceIri: string]: TResource
}

export default class DalApi {
    private readonly endpointBaseUri: string;

    constructor() {
        this.endpointBaseUri = GenappEnvConfig.Host;
    }

    /**
     * Performs a call to generate Dataspecer artifacts for all data structure models included in the data specification
     * represented by its IRI identifier.
     *
     * @param dataSpecificationIri - The IRI of the data specification for which artifacts will be generated.
     * @returns Backend service response object which contains the ZIP represented as a Buffer object, which contains the generated
     * artifacts.
     */
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

    /**
     * Fetches a data specification representation data from Dataspecer backend service which corresponds to the provided IRI.
     *
     * @param dataSpecificationIri - The IRI of the data specification to fetch.
     * @returns Promise which, when resolved, returns the fetched DataSpecification instance.
     */
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


    /**
     * Fetches a Resource from the specified dataspecer backend endpoint based on the provided resource IRI.
     *
     * @param {string} resourceIri - The IRI of the resource to fetch.
     * @returns {Promise<any>} A promise that resolves to the data of the fetched resource.
     * @throws {Error} Throws an error if the resource cannot be fetched.
     */
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


    /**
     * Retrieves a data structure model data for a given structure model included within the data specification.
     *
     * @param structureIri - The IRI identifier of the data structure model within the data specification.
     * @returns A promise that resolves to the data structure model representation object - DataPsmSchema instance.
     * @throws Throws an error if the specified data structure is not found within the data specification.
     * @throws Throws an error when the IRI does not reference any valid data structure model instance.
     */
    async getStructureInfo(dataSpecificationIri: string, structureIri: string): Promise<DataPsmSchema> {

        const specificationModel = await this.getDataSpecification(dataSpecificationIri);

        if (!specificationModel.psms.includes(structureIri)) {
            throw new Error(`Selected data specification does not contain data structure: ${structureIri}`);
        }

        const resourceResponse = await this.getResource(structureIri);

        const psmResourceMap = resourceResponse as ResourceMap<DataPsmSchema>;
        const structureModel = psmResourceMap[structureIri];

        if (!structureModel) {
            throw new Error(`"${structureIri}" does not reference any valid data structure model.`);
        }

        return structureModel;
    }
}
