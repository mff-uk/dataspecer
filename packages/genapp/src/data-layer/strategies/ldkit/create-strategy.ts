import { GenerationContext } from "../../../engine/generator-stage-interface";
import { DalGeneratorStrategy } from "../../strategy-interface";
import { LdkitSchemaProvider, SchemaProvider } from "./ldkit-schema-provider";
import { CreateLdkitInstanceGenerator } from "../../template-generators/ldkit/create/create-instance-generator";
import { DatasourceConfig, DataSourceType } from "../../../engine/graph/datasource";

export class CreateLdkitInstanceDalStrategy implements DalGeneratorStrategy {
    strategyIdentifier: string = "create-ldkit-instance";

    private readonly _schemaProvider: SchemaProvider;
    private readonly _sparqlEndpointUri: string;

    constructor(specificationIri: string, datasourceConfig: DatasourceConfig) {
        if (datasourceConfig.format !== DataSourceType.Rdf) {
            throw new Error("Trying to generate LDkit data access with different datasource");
        }

        this._schemaProvider = new LdkitSchemaProvider(specificationIri);
        this._sparqlEndpointUri = datasourceConfig.endpoint;
    }

    async generateDataLayer(context: GenerationContext) {

        const ldkitSchemaArtifact = await this._schemaProvider.getSchemaArtifact(context.aggregate);

        const instanceCreatorDataLayerArtifact = new CreateLdkitInstanceGenerator({
            filePath: `./writers/${this.strategyIdentifier}/${context.aggregate.technicalLabel}-create-instance.ts`,
            templatePath: "./create/data-layer/ldkit/instance-creator",
        })
            .processTemplate({
                aggregate: context.aggregate,
                sparqlEndpointUri: this._sparqlEndpointUri,
                ldkitSchemaArtifact: ldkitSchemaArtifact,
                pathResolver: context._.pathResolver
            });

        return instanceCreatorDataLayerArtifact;
    }
}