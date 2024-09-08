import path from "path";
import JSZip from "jszip";
import DalApi from "../../dal-generator-api";
import { AxiosResponse } from "axios";
import { LayerArtifact } from "../../../engine/layer-artifact";
import { AggregateMetadata } from "../../../application-config";
import { PimSchema } from "@dataspecer/core/pim/model";
import { normalizeName } from "../../../utils/utils";

function isAxiosResponse(
    dataLayerResult: LayerArtifact | AxiosResponse<LayerArtifact, any> | AxiosResponse<Buffer, any>
): dataLayerResult is AxiosResponse<LayerArtifact, any> {
    return (dataLayerResult as AxiosResponse<LayerArtifact, any>).data !== undefined;
}

export interface SchemaProvider {
    getSchemaArtifact(aggregateIri: AggregateMetadata): Promise<LayerArtifact>;
}

class DataspecerBaseSchemaProvider {

    protected readonly _api: DalApi;
    protected readonly _dataSpecificationIri: string;

    constructor(dataSpecificationIri: string) {
        this._api = new DalApi();
        this._dataSpecificationIri = dataSpecificationIri;
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

        console.log("SPEC SCHEMA: ", specificationSchema);

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

    protected async getSchemaLayerArtifact(file: JSZip.JSZipObject, aggregate: AggregateMetadata, schemaIdentifier: string): Promise<LayerArtifact> {
        const fileContent = await file.async("string");
        const result: LayerArtifact = {
            filePath: path.posix.join("schemas", schemaIdentifier, `${aggregate.technicalLabel}-schema.ts`),
            sourceText: fileContent,
            exportedObjectName: aggregate.getAggregateNamePascalCase({
                suffix: "Schema"
            })
        }

        return result;
    }
}

export class LdkitSchemaProvider extends DataspecerBaseSchemaProvider implements SchemaProvider {

    private readonly ldkitSchemaFileName = "ldkit-schema.ts";

    constructor(dataSpecificationIri: string) {
        super(dataSpecificationIri);
    }

    async getSchemaArtifact(aggregate: AggregateMetadata): Promise<LayerArtifact> {

        const zipSubdirectory = await this.getAggregateSchemaFile(aggregate);
        const ldkitSchemaFiles = zipSubdirectory.filter((_, file) => file.name.endsWith(this.ldkitSchemaFileName));

        if (!ldkitSchemaFiles || ldkitSchemaFiles.length !== 1) {
            throw new Error(`No LDkit schema file found for aggregate ${aggregate.aggregateName}`);
        }

        const aggregateSchemaFile = ldkitSchemaFiles.at(0)!;
        return this.getSchemaLayerArtifact(aggregateSchemaFile, aggregate, "ldkit");
    }

}

export class JsonSchemaProvider extends DataspecerBaseSchemaProvider implements SchemaProvider {

    private readonly jsonSchemaFileName = "schema.json";

    async getSchemaArtifact(aggregate: AggregateMetadata): Promise<LayerArtifact> {

        const zipSubdirectory = await this.getAggregateSchemaFile(aggregate);

        const jsonSchemaFiles = zipSubdirectory.filter((_, file) => file.name.endsWith(this.jsonSchemaFileName));

        if (!jsonSchemaFiles || jsonSchemaFiles.length !== 1) {
            throw new Error(`No LDkit schema file found for aggregate ${aggregate.aggregateName}`);
        }

        const aggregateSchemaFile = jsonSchemaFiles.at(0)!;
        return this.getSchemaLayerArtifact(aggregateSchemaFile, aggregate, "json");
    }
}