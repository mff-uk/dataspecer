import path from "path";
import JSZip from "jszip";
import DalApi from "../../dal-generator-api";
import { AxiosResponse } from "axios";
import { LayerArtifact } from "../../../engine/layer-artifact";

function isAxiosResponse(
    dataLayerResult: LayerArtifact | AxiosResponse<LayerArtifact, any> | AxiosResponse<Buffer, any>
): dataLayerResult is AxiosResponse<LayerArtifact, any>
{
    return (dataLayerResult as AxiosResponse<LayerArtifact, any>).data !== undefined;
}

export interface SchemaProvider {
    getSchemaArtifact(aggregateName: string): Promise<LayerArtifact>;
}

export class LdkitSchemaProvider implements SchemaProvider {

    private readonly _backendUrl = "http://localhost:8889";
    private readonly _api: DalApi;

    constructor() {
        this._api = new DalApi(this._backendUrl);
    }

    async getSchemaArtifact(aggregateName: string): Promise<LayerArtifact> {
        const response = await this._api.generateDalLayerArtifact("ldkit", aggregateName);

        if (!isAxiosResponse(response) || response.status !== 200) {
            throw new Error("Invalid artifact returned from server");
        }

        const zip = await JSZip.loadAsync(response.data);

        if (!zip.folder("genapp") || !zip.folder("genapp")?.folder("LDkit")) {
            throw new Error("Missing LDkit artifact");
        }

        const aggregateFiles = zip.filter(path => path.includes(aggregateName.toLowerCase()));

        if (!aggregateFiles || aggregateFiles.length !== 1) {
            throw new Error("No LDkit schema file found for selected aggregate");
        }

        const aggregateSchemaFile = aggregateFiles.at(0)!;
        
        const contentPromise = aggregateSchemaFile.async("string");
        const schemaFilename = aggregateSchemaFile.name.substring(aggregateSchemaFile.name.lastIndexOf("/") + 1);

        const fileContent = await contentPromise;
        const result: LayerArtifact = {
            filePath: path.posix.join("schemas", "ldkit", schemaFilename),
            sourceText: fileContent,
            exportedObjectName: `${aggregateName}Schema`
        }
        return result;
    }
}