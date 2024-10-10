import { LayerArtifact } from "../../engine/layer-artifact";
import { DalGeneratorStrategy } from "../strategy-interface";
import { GenerationContext } from "../../engine/generator-stage-interface";
import { DataSourceType, DatasourceConfig } from "../../engine/graph/datasource";
import { LdkitSchemaProvider } from "../schema-providers/ldkit-schema-provider";
import { SchemaProvider } from "../schema-providers/base-schema-provider";
import { TemplateConsumer } from "../../engine/templates/template-consumer";
import { DataLayerTemplateDescription } from "../../engine/templates/template-interfaces";
import { LdkitObjectModelTypeGenerator } from "../template-generators/ldkit/object-model-type-generator";

export class TemplateDataLayerGeneratorStrategy<TDalTemplate extends DataLayerTemplateDescription> implements DalGeneratorStrategy {

    strategyIdentifier: string = "ldkit-dal-strategy";
    private readonly _schemaProvider: SchemaProvider;
    private readonly _sparqlEndpointUri: string;
    private readonly _templateDataLayerGenerator: TemplateConsumer<TDalTemplate>;

    constructor(templateGenerator: TemplateConsumer<TDalTemplate>, specificationIri: string, datasourceConfig: DatasourceConfig) {
        if (datasourceConfig.format !== DataSourceType.RDF) {
            throw new Error("Trying to generate LDkit data access with different datasource");
        }

        this._schemaProvider = new LdkitSchemaProvider(specificationIri);
        this._sparqlEndpointUri = datasourceConfig.endpoint;
        this._templateDataLayerGenerator = templateGenerator;
    }

    async generateDataLayer(context: GenerationContext): Promise<LayerArtifact> {

        const dataLayerSchemaArtifact = await this._schemaProvider.getSchemaArtifact(context.aggregate);

        const schemaInterfaceArtifact = await new LdkitObjectModelTypeGenerator({
            filePath: `./types/${context.aggregate.technicalLabel}-object-model.ts`,
            // TODO: move template file to more general ldkit path
            templatePath: `./list/data-layer/ldkit/object-model-type`
        }).processTemplate({
            aggregate: context.aggregate,
            ldkitSchemaArtifact: dataLayerSchemaArtifact
        });

        const dataLayerTemplateArtifact = this._templateDataLayerGenerator
            .processTemplate({
                aggregate: context.aggregate,
                pathResolver: context._.pathResolver,
                ldkitSchemaArtifact: dataLayerSchemaArtifact,
                sparqlEndpointUri: this._sparqlEndpointUri,
                ldkitSchemaInterfaceArtifact: schemaInterfaceArtifact
            }
        );

        return dataLayerTemplateArtifact;
    }
}