import path from "path";
import { LayerArtifact } from "../../../engine/layer-artifact";
import { DalGeneratorStrategy } from "../../strategy-interface";
import { GenerationContext } from "../../../engine/generator-stage-interface";
import { DataSourceType, DatasourceConfig } from "../../../engine/graph/datasource";
import { LdkitSchemaProvider, SchemaProvider } from "./ldkit-schema-provider";
import { InstanceDetailLdkitReaderGenerator } from "../../template-generators/ldkit/detail/instance-detail-reader-generator";

export class LdkitDetailDalGenerator implements DalGeneratorStrategy {

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

        const instanceDetailReaderArtifact = new InstanceDetailLdkitReaderGenerator({
            filePath: `./readers/${this.strategyIdentifier}/${context.aggregate.technicalLabel}-detail.ts`,
            templatePath: `./detail/data-layer/${this.strategyIdentifier}/instance-detail-reader`,
        }).processTemplate({
            aggregate: context.aggregate,
            pathResolver: context._.pathResolver,
            ldkitSchemaArtifact: ldkitSchemaArtifact,
            sparqlEndpointUri: this._sparqlEndpointUri
        });

        return instanceDetailReaderArtifact;
    }
}
