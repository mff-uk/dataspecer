import { AxiosResponse } from "axios";
import { GenerationContext } from "../../engine/generator-stage-interface.ts";
import { LayerArtifact } from "../../engine/layer-artifact.ts";
import { DalGeneratorStrategy } from "../strategy-interface.ts";
import { DatasourceConfig, DataSourceType } from "../../engine/graph/index.ts";
import { SchemaProvider } from "../schema-providers/base-schema-provider.ts";
import { JsonSchemaProvider } from "../schema-providers/json-schema-provider.ts";
import { EndpointUri } from "../../engine/graph/datasource.ts";

class JsonDalStrategy implements DalGeneratorStrategy {

    strategyIdentifier: string = "json";
    private readonly _schemaProvider: SchemaProvider;
    private readonly _jsonUri: EndpointUri;

    constructor(specificationIri: string, datasourceConfig: DatasourceConfig) {
        if (datasourceConfig.format !== DataSourceType.JSON) {
            throw new Error("Trying to generate JSON data access with different datasource");
        }

        this._schemaProvider = new JsonSchemaProvider(specificationIri);
        this._jsonUri = datasourceConfig.endpoint;
    }

    async generateDataLayer(context: GenerationContext): Promise<LayerArtifact> {
        const jsonSchemaArtifact = await this._schemaProvider.getSchemaArtifact(context.aggregate);

        return jsonSchemaArtifact;
    }

}