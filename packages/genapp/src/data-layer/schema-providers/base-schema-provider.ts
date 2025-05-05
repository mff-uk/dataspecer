import JSZip from "jszip";
import DalApi from "../dal-generator-api.ts";
import { AxiosResponse } from "axios";
import { normalizeName } from "../../utils/utils.ts";
import { PimSchema } from "@dataspecer/core/pim/model";
import { LayerArtifact } from "../../engine/layer-artifact.ts";
import { AggregateMetadata } from "../../application-config.ts";

function isAxiosResponse(
    dataLayerResult: LayerArtifact | AxiosResponse<LayerArtifact, any> | AxiosResponse<Buffer, any>
): dataLayerResult is AxiosResponse<LayerArtifact, any> {
    return (dataLayerResult as AxiosResponse<LayerArtifact, any>).data !== undefined;
}

export interface SchemaProvider {
    getSchemaArtifact(aggregate: AggregateMetadata): Promise<LayerArtifact>;
}

export abstract class DataspecerBaseSchemaProvider {

    protected readonly _api: DalApi;
    protected readonly _dataSpecificationIri: string;

    private readonly _schemaFilename: string;

    constructor(dataSpecificationIri: string, schemaFilename: string) {
        this._api = new DalApi();
        this._dataSpecificationIri = dataSpecificationIri;
        this._schemaFilename = schemaFilename;
    }

    async getSchemaArtifact(aggregate: AggregateMetadata): Promise<LayerArtifact> {

        const zipSubdirectory = await this.getAggregateSchemaFile(aggregate);

        const schemaFiles = zipSubdirectory.filter((_, file) => file.name.endsWith(this._schemaFilename));

        if (!schemaFiles || schemaFiles.length !== 1) {
            throw new Error(`No LDkit schema file found for aggregate ${aggregate.aggregateName}`);
        }

        const aggregateSchemaFile = schemaFiles.at(0)!;
        return this.getSchemaLayerArtifact(aggregateSchemaFile, aggregate);
    }

    protected async getAggregateSchemaFile(aggregate: AggregateMetadata): Promise<JSZip> {
        const response = await this._api.generateDalLayerArtifact(this._dataSpecificationIri);

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

    protected abstract getSchemaLayerArtifact(file: JSZip.JSZipObject, aggregate: AggregateMetadata): Promise<LayerArtifact>;

}