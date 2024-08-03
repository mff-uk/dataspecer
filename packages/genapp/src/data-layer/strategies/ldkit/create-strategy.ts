import { StageGenerationContext } from "../../../engine/generator-stage-interface";
import { DalGeneratorStrategy } from "../../strategy-interface";
import { LdkitSchemaProvider, SchemaProvider } from "./ldkit-schema-provider";
import { CreateLdkitInstanceGenerator } from "../../template-generators/ldkit/create/create-instance-generator";
import { DatasourceConfig, DataSourceType } from "../../../application-config";

export class CreateLdkitInstanceDalStrategy implements DalGeneratorStrategy {
    strategyIdentifier: string = "create-ldkit-instance";

    private readonly _schemaProvider: SchemaProvider;
    private readonly _sparqlEndpointUri: string;

    constructor(datasourceConfig: DatasourceConfig) {
        if (datasourceConfig.format !== DataSourceType.Rdf) {
            throw new Error("Trying to generate LDkit data access with different datasource");
        }

        this._schemaProvider = new LdkitSchemaProvider();
        this._sparqlEndpointUri = datasourceConfig.endpointUri;
    }

    async generateDataLayer(context: StageGenerationContext) {

        const ldkitSchemaArtifact = await this._schemaProvider.getSchemaArtifact(context.aggregateName);

        const instanceCreatorDataLayerArtifact = new CreateLdkitInstanceGenerator({
            aggregateName: context.aggregateName,
            filePath: `./writers/${this.strategyIdentifier}/${context.aggregateName.toLowerCase()}-create-instance.ts`,
            templatePath: "./create/data-layer/ldkit/instance-creator",
        })
            .processTemplate({
                sparqlEndpointUri: this._sparqlEndpointUri,
                ldkitSchemaArtifact: ldkitSchemaArtifact,
                pathResolver: context._.pathResolver
            });

        return instanceCreatorDataLayerArtifact;
    }
}