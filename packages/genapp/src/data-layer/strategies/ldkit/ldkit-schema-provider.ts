import path from "path";
import JSZip from "jszip";
import DalApi from "../../dal-generator-api";
import { AxiosResponse } from "axios";
import { LayerArtifact } from "../../../engine/layer-artifact";
import { AggregateMetadata } from "../../../application-config";

function isAxiosResponse(
    dataLayerResult: LayerArtifact | AxiosResponse<LayerArtifact, any> | AxiosResponse<Buffer, any>
): dataLayerResult is AxiosResponse<LayerArtifact, any>
{
    return (dataLayerResult as AxiosResponse<LayerArtifact, any>).data !== undefined;
}

export interface SchemaProvider {
    getSchemaArtifact(aggregateIri: AggregateMetadata): Promise<LayerArtifact>;
}

export class LdkitSchemaProvider implements SchemaProvider {

    private readonly _api: DalApi;
    private readonly _dataSpecificationIri: string;

    constructor(dataSpecificationIri: string) {
        this._api = new DalApi();
        this._dataSpecificationIri = dataSpecificationIri;
    }

    private getAggregateUuid(aggregateIri: string): string {
        return aggregateIri.slice(aggregateIri.lastIndexOf("/") + 1);
    }

    async getSchemaArtifact(aggregate: AggregateMetadata): Promise<LayerArtifact> {
        const response = await this._api.generateDalLayerArtifact(this._dataSpecificationIri);

        if (!isAxiosResponse(response) || response.status !== 200) {
            throw new Error("Invalid artifact returned from server");
        }

        const zip = await JSZip.loadAsync(response.data);

        if (!zip.folder("genapp") || !zip.folder("genapp")?.folder("LDkit")) {
            throw new Error("Missing LDkit artifact");
        }

        const uuid = this.getAggregateUuid(aggregate.iri);
        const aggregateFiles = zip.filter(path => path.includes(uuid));

        if (!aggregateFiles || aggregateFiles.length !== 1) {
            throw new Error("No LDkit schema file found for selected aggregate");
        }

        const aggregateSchemaFile = aggregateFiles.at(0)!;

        const contentPromise = aggregateSchemaFile.async("string");

        const fileContent = await contentPromise;
        const result: LayerArtifact = {
            filePath: path.posix.join("schemas", "ldkit", `${aggregate.technicalLabel}-schema.ts`),
            sourceText: fileContent,
            exportedObjectName: aggregate.getAggregateNamePascalCase({
                suffix: "Schema"
            })
        }
        return result;
    }
}