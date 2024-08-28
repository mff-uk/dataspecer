import { LayerArtifact } from "../../../engine/layer-artifact";
import { DalGeneratorStrategy } from "../../strategy-interface";
import { GenerationContext } from "../../../engine/generator-stage-interface";
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
        this._sparqlEndpointUri = datasourceConfig.endpoint;
    }

    async generateDataLayer(context: GenerationContext): Promise<LayerArtifact> {

        const ldkitSchemaArtifact = await this._schemaProvider.getSchemaArtifact(context.aggregateName);

        const instanceListReaderArtifact = new InstanceListLdkitReaderGenerator({
            filePath: `./readers/${this.strategyIdentifier}/${context.technicalAggregateName}-list.ts`,
            templatePath: `./list/data-layer/${this.strategyIdentifier}/aggregate-specific-reader`,
        })
        .processTemplate({
            // TODO: Change to human label aggregate name identifier (without spaces pascal camel case)
            aggregateHumanLabel: context.technicalAggregateName,
            ldkitSchemaArtifact: ldkitSchemaArtifact,
            sparqlEndpointUri: this._sparqlEndpointUri
        });

        return instanceListReaderArtifact;
    }
}
