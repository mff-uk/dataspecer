import path from "path";
import { LayerArtifact } from "../../../engine/layer-artifact";
import { DalGeneratorStrategy } from "../../strategy-interface";
import { GenerationContext } from "../../../engine/generator-stage-interface";
import { DataSourceType, DatasourceConfig } from "../../../application-config";
import { LdkitSchemaProvider, SchemaProvider } from "./ldkit-schema-provider";
import { InstanceDetailLdkitReaderGenerator } from "../../template-generators/ldkit/detail/instance-detail-reader-generator";

export class LdkitDetailDalGenerator implements DalGeneratorStrategy {
    
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

        const instanceDetailReaderArtifact = new InstanceDetailLdkitReaderGenerator({
            filePath: path.posix.join("readers", this.strategyIdentifier, `${context.technicalAggregateName}-detail.ts`),
            templatePath: `./detail/data-layer/${this.strategyIdentifier}/instance-detail-reader`,
        }).processTemplate({
            // TODO: Change to human label aggregate name identifier (without spaces pascal camel case)
            aggregateHumanLabel: context.technicalAggregateName,
            pathResolver: context._.pathResolver,
            ldkitSchemaArtifact: ldkitSchemaArtifact,
            sparqlEndpointUri: this._sparqlEndpointUri
        });

        return instanceDetailReaderArtifact;
    }
}
