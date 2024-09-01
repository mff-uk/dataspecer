import { DatasourceConfig, DataSourceType } from "../../../application-config";
import { GenerationContext } from "../../../engine/generator-stage-interface";
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

    async generateDataLayer(context: GenerationContext) {

        const ldkitSchemaArtifact = await this._schemaProvider.getSchemaArtifact(context.aggregate.iri);

        const instanceListReaderArtifact = new InstanceDeleteLdkitGenerator({
            filePath: `./writers/${this.strategyIdentifier}/${context.aggregate.technicalLabel}-instance-delete.ts`,
            templatePath: "./delete/data-layer/ldkit/instance-delete-mutator",
        })
        .processTemplate({
            aggregate: context.aggregate,
            sparqlEndpointUri: this._sparqlEndpointUri,
            ldkitSchemaArtifact: ldkitSchemaArtifact,
            pathResolver: context._.pathResolver
        });

        return instanceListReaderArtifact;
    }

}