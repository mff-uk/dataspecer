import { LayerArtifact } from "../../../engine/layer-artifact";
import { DalGeneratorStrategy } from "../../strategy-interface";
import { StageGenerationContext } from "../../../engine/generator-stage-interface";
import { DataSourceType, DatasourceConfig } from "../../../application-config";
import { LdkitSchemaProvider, SchemaProvider } from "./ldkit-schema-provider";
import { InstanceListLdkitReaderGenerator } from "../../template-generators/ldkit/list/instance-list-reader-generator";

export class LdkitListDalGenerator implements DalGeneratorStrategy {
    
    strategyIdentifier: string = "ldkit";
    private readonly _schemaProvider: SchemaProvider;
    private readonly _sparqlEndpointUri: string;

    constructor(datasourceConfig: DatasourceConfig) {
        if (datasourceConfig.format !== DataSourceType.Rdf) {
            throw new Error("Trying to generate LDkit data access with different datasource");
        }
        
        this._schemaProvider = new LdkitSchemaProvider();
        this._sparqlEndpointUri = datasourceConfig.endpointUri;
    }

    async generateDataLayer(context: StageGenerationContext): Promise<LayerArtifact> {

        const ldkitSchemaArtifact = await this._schemaProvider.getSchemaArtifact(context.aggregateName);

        const instanceListReaderArtifact = new InstanceListLdkitReaderGenerator({
            aggregateName: context.aggregateName,
            filePath: `./readers/${this.strategyIdentifier}/${context.aggregateName.toLowerCase()}-list.ts`,
            templatePath: "./list/data-layer/ldkit/aggregate-specific-reader",
        })
        .processTemplate({
            ldkitSchemaArtifact: ldkitSchemaArtifact,
            sparqlEndpointUri: this._sparqlEndpointUri
        });

        return instanceListReaderArtifact;
    }
}
