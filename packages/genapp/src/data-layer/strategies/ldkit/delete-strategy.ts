import { DatasourceConfig, DataSourceType } from "../../../application-config";
import { StageGenerationContext } from "../../../engine/generator-stage-interface";
import { DalGeneratorStrategy } from "../../strategy-interface";
import { InstanceDeleteLdkitGenerator } from "../../template-generators/ldkit/delete/instance-delete-generator";
import { LdkitSchemaProvider, SchemaProvider } from "./ldkit-schema-provider";

export class LdkitDeleteDalGenerator implements DalGeneratorStrategy {
    strategyIdentifier: string = "ldkit-instance-delete";

    private readonly _schemaProvider: SchemaProvider;
    private readonly _sparqlEndpointUri: string;

    constructor(datasourceConfig: DatasourceConfig) {

        if (datasourceConfig.format !== DataSourceType.Rdf) {
            throw new Error("Trying to generate LDkit data access with different datasource");
        }
        
        this._schemaProvider = new LdkitSchemaProvider();
        this._sparqlEndpointUri = datasourceConfig.endpoint;
    }

    async generateDataLayer(context: StageGenerationContext) {

        const ldkitSchemaArtifact = await this._schemaProvider.getSchemaArtifact(context.aggregateName);

        const instanceListReaderArtifact = new InstanceDeleteLdkitGenerator({
            aggregateName: context.aggregateName,
            filePath: `./writers/${this.strategyIdentifier}/${context.aggregateName.toLowerCase()}-instance-delete.ts`,
            templatePath: "./delete/data-layer/ldkit/instance-delete-mutator",
        })
        .processTemplate({
            sparqlEndpointUri: this._sparqlEndpointUri,
            ldkitSchemaArtifact: ldkitSchemaArtifact,
            pathResolver: context._.pathResolver
        });

        return instanceListReaderArtifact;
    }

}