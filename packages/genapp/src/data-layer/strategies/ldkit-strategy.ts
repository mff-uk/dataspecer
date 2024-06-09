import path from "path";
import JSZip from "jszip";
import DalApi from "../dal-generator-api";
import { AxiosResponse } from "axios";
import { LayerArtifact } from "../../engine/layer-artifact";
import { DalGeneratorStrategy } from "../dal-generator-strategy-interface";
import { StageGenerationContext } from "../../engine/generator-stage-interface";
import { TemplateGenerator } from "../../app-logic-layer/template-app-logic-generator";
import { DataSourceType, DatasourceConfig } from "../../application-config";
import { InstanceListLdkitReaderGenerator } from "../../template-interfaces/data/instance-list-reader-template";

export function isAxiosResponse(
    dataLayerResult: LayerArtifact | AxiosResponse<LayerArtifact, any> | AxiosResponse<Buffer, any>
): dataLayerResult is AxiosResponse<LayerArtifact, any>
{
    return (dataLayerResult as AxiosResponse<LayerArtifact, any>).data !== undefined;
}

export class LDKitDalGenerator implements DalGeneratorStrategy {
    
    _strategyIdentifier: string = "ldkit";
    private readonly _backendUrl = "http://localhost:8889";
    private readonly _api: DalApi;
    private readonly _sparqlEndpointUri: string;

    constructor(datasourceConfig: DatasourceConfig) {
        if (datasourceConfig.format !== DataSourceType.Rdf) {
            throw new Error("Trying to generate LDkit data access with different datasource");
        }
        
        this._api = new DalApi(this._backendUrl);
        this._sparqlEndpointUri = datasourceConfig.endpointUri;
    }

    async generateDataLayer(context: StageGenerationContext): Promise<LayerArtifact> {

        const ldkitSchemaArtifact = await this.getLdkitSchema(context.aggregateName);

        const instanceListReaderArtifact = new InstanceListLdkitReaderGenerator({
            aggregateName: context.aggregateName,
            filePath: `./readers/${this._strategyIdentifier}/${context.aggregateName}-list-implementation.ts`,
            templatePath: "./list/instance-ldkit-list-reader",
        })
        .setLdkitSchemaDependency(ldkitSchemaArtifact)
        .setLdkitSparqlEndpointDependency(this._sparqlEndpointUri)
        .consumeTemplate();

        return instanceListReaderArtifact;
    }

    private async getLdkitSchema(aggregateName: string): Promise<LayerArtifact> {
        const response = await this._api.generateDalLayerArtifact(this._strategyIdentifier, aggregateName);

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
            filePath: path.posix.join("schemas", this._strategyIdentifier, schemaFilename),
            sourceText: fileContent,
            exportedObjectName: `${aggregateName}Schema`
        }
        return result;
    }
}
