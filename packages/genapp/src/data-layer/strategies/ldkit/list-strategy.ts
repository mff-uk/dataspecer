import { LayerArtifact } from "../../../engine/layer-artifact";
import { DalGeneratorStrategy } from "../../strategy-interface";
import { GenerationContext } from "../../../engine/generator-stage-interface";
import { DataSourceType, DatasourceConfig } from "../../../engine/graph/datasource";
import { LdkitSchemaProvider } from "../../schema-providers/ldkit-schema-provider";
import { InstanceListLdkitReaderGenerator } from "../../template-generators/ldkit/list/instance-list-reader-generator";
import { SchemaProvider } from "../../schema-providers/base-schema-provider";

export class LdkitListDalGenerator implements DalGeneratorStrategy {

    strategyIdentifier: string = "ldkit";
    private readonly _schemaProvider: SchemaProvider;
    private readonly _sparqlEndpointUri: string;

    constructor(specificationIri: string, datasourceConfig: DatasourceConfig) {
        if (datasourceConfig.format !== DataSourceType.RDF) {
            throw new Error("Trying to generate LDkit data access with different datasource");
        }

        this._schemaProvider = new LdkitSchemaProvider(specificationIri);
        this._sparqlEndpointUri = datasourceConfig.endpoint;
    }

    async generateDataLayer(context: GenerationContext): Promise<LayerArtifact> {

        const ldkitSchemaArtifact = await this._schemaProvider.getSchemaArtifact(context.aggregate);

        const instanceListReaderArtifact = new InstanceListLdkitReaderGenerator({
            filePath: `./readers/${this.strategyIdentifier}/${context.aggregate.technicalLabel}-list.ts`,
            templatePath: `./list/data-layer/${this.strategyIdentifier}/aggregate-specific-reader`,
        })
        .processTemplate({
            aggregate: context.aggregate,
            ldkitSchemaArtifact: ldkitSchemaArtifact,
            sparqlEndpointUri: this._sparqlEndpointUri
        });

        return instanceListReaderArtifact;
    }
}
