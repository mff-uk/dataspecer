import { LayerArtifact } from "../../../engine/layer-artifact";
import { DalGeneratorStrategy } from "../../strategy-interface";
import { StageGenerationContext } from "../../../engine/generator-stage-interface";
import { DataSourceType, DatasourceConfig } from "../../../application-config";
import { LdkitSchemaProvider, SchemaProvider } from "./ldkit-schema-provider";
import { InstanceDetailLdkitReaderGenerator } from "../../template-generators/ldkit/detail/instance-detail-reader-generator";
import path from "path";

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

    async generateDataLayer(context: StageGenerationContext): Promise<LayerArtifact> {

        const ldkitSchemaArtifact = await this._schemaProvider.getSchemaArtifact(context.aggregateName);

        const instanceDetailReaderArtifact = new InstanceDetailLdkitReaderGenerator({
            aggregateName: context.aggregateName,
            filePath: path.posix.join(".", "readers", this.strategyIdentifier, `${context.aggregateName.toLowerCase()}-detail.ts`),
            templatePath: `./detail/data-layer/${this.strategyIdentifier}/instance-detail-reader`,
        }).processTemplate({
            pathResolver: context._.pathResolver,
            ldkitSchemaArtifact: ldkitSchemaArtifact,
            sparqlEndpointUri: this._sparqlEndpointUri
        });

        return instanceDetailReaderArtifact;
    }
}
