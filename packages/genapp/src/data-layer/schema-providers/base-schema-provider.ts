import JSZip from "jszip";
import DalApi from "../dal-generator-api";
import { AxiosResponse } from "axios";
import { normalizeName } from "../../utils/utils";
import { PimSchema } from "@dataspecer/core/pim/model";
import { LayerArtifact } from "../../engine/layer-artifact";
import { AggregateMetadata } from "../../application-config";

/** @ignore */
function isAxiosResponse(
    dataLayerResult: LayerArtifact | AxiosResponse<LayerArtifact, any> | AxiosResponse<Buffer, any>
): dataLayerResult is AxiosResponse<LayerArtifact, any> {
    return (dataLayerResult as AxiosResponse<LayerArtifact, any>).data !== undefined;
}

export interface SchemaProvider {
    getSchemaArtifact(aggregate: AggregateMetadata): Promise<LayerArtifact>;
}

/**
 * Abstract base class for providing schema-related functionalities in the Dataspecer application.
 *
 * This class serves as a foundation for schema providers, offering methods to retrieve schema artifacts
 * and handle schema files for specific aggregates. It interacts with a remote server to fetch the necessary
 * data and processes it to extract schema information.
 *
 * @abstract
 */
export abstract class DataspecerBaseSchemaProvider {

    protected readonly _api: DalApi;
    protected readonly _dataSpecificationIri: string;

    private readonly _schemaFilename: string;

    constructor(dataSpecificationIri: string, schemaFilename: string) {
        this._api = new DalApi();
        this._dataSpecificationIri = dataSpecificationIri;
        this._schemaFilename = schemaFilename;
    }

    /**
     * Retrieves the schema artifact for a given aggregate.
     *
     * @param aggregate - The metadata for an aggregate for which the schemas should be retrieved.
     * @returns A promise that resolves to the layer artifact file describing the schema of the aggregate. The schema is format-specific and is defined within the configuration.
     * @throws Throw an error if no corresponding schemas is found for the given aggregate or if multiple schema files are found.
     */
    async getSchemaArtifact(aggregate: AggregateMetadata): Promise<LayerArtifact> {

        const zipSubdirectory = await this.getAggregateSchemaFile(aggregate);

        const schemaFiles = zipSubdirectory.filter((_, file) => file.name.endsWith(this._schemaFilename));

        if (!schemaFiles || schemaFiles.length !== 1) {
            throw new Error(`No LDkit schema file found for aggregate ${aggregate.aggregateName}`);
        }

        const aggregateSchemaFile = schemaFiles.at(0)!;
        return this.getSchemaLayerArtifact(aggregateSchemaFile, aggregate);
    }


    /**
     * Retrieves schema files for the structure models defined within a data specification and navigates to the subdirectory
     * which contains the schemas for a specified aggregate. Currently, the schemas are provided by Dataspecer backend service.
     *
     * @param aggregate - The metadata for an aggregate for which the schemas should be retrieved.
     * @returns A promise that resolves to a JSZip object containing the schemas for the specified aggregate.
     * @throws Throws an error if the Dataspecer backend service response is not valid or if the requested schemas are missing in the zip archive.
     */
    protected async getAggregateSchemaFile(aggregate: AggregateMetadata): Promise<JSZip> {
        const response = await this._api.generatePsmSchemaArtifacts(this._dataSpecificationIri);

        if (!isAxiosResponse(response) || response.status !== 200) {
            throw new Error("Invalid artifact returned from server");
        }

        const zip = await JSZip.loadAsync(response.data);
        const specificationDirectoryName = await this.getNormalizedSpecificationDirectoryName(aggregate.specificationIri);

        if (!zip.folder(`${specificationDirectoryName}`)) {
            throw new Error(`Missing data specification artifacts for ${specificationDirectoryName}`);
        }

        const subdirectory = `${specificationDirectoryName}/${aggregate.aggregateName}`;

        if (!zip.folder(subdirectory)) {
            throw new Error(`Missing schema artifacts for ${aggregate.aggregateName}`);
        }

        return zip.folder(subdirectory)!;
    }

    /**
     * This method attempts to retrieve a human-readable label for specified data specification which is represented by IRI.
     *
     * @param dataSpecificationIri - The IRI identifier of the data specification.
     * @returns A promise that resolves as normalized directory name.
     */
    protected async getNormalizedSpecificationDirectoryName(dataSpecificationIri: string): Promise<string> {

        const fallbackName: string = dataSpecificationIri.split("/").pop() as string

        const specificationPimIri = (await this._api.getDataSpecification(dataSpecificationIri)).pim;

        console.log("SPEC PIM IRI: ", specificationPimIri);

        if (!specificationPimIri) {
            return fallbackName;
        }

        const specificationSchema = (await this._api.getResource(specificationPimIri))[specificationPimIri] as PimSchema;

        if (!specificationSchema?.pimHumanLabel || Object.values(specificationSchema.pimHumanLabel!).length === 0) {
            return fallbackName;
        }

        const specificationName = specificationSchema.pimHumanLabel["en"]
            ? specificationSchema.pimHumanLabel["en"]
            : Object.values(specificationSchema.pimHumanLabel).at(0)!;

        if (specificationName) {
            return normalizeName(specificationName);
        }

        return fallbackName;
    }

    /**
     * Generates a layer artifact which contains the data schema for the specified aggregate.
     * The classes which implement this method generate a format-specific schema artifacts.
     *
     * @param file - The JSZipObject representing the file to be processed.
     * @param aggregate - The aggregate metadata for which the schema is being generated.
     * @returns A promise that resolves to a LayerArtifact containing the schema.
     */
    protected abstract getSchemaLayerArtifact(file: JSZip.JSZipObject, aggregate: AggregateMetadata): Promise<LayerArtifact>;
}