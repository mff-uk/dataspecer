import { LayerArtifact } from "../../engine/layer-artifact.ts";
import { DalGeneratorStrategy } from "../strategy-interface.ts";
import { GenerationContext } from "../../engine/generator-stage-interface.ts";
import { DataSourceType, DatasourceConfig, EndpointUri } from "../../engine/graph/datasource.ts";
import { LdkitSchemaProvider } from "../schema-providers/ldkit-schema-provider.ts";
import { SchemaProvider } from "../schema-providers/base-schema-provider.ts";
import { TemplateConsumer, TemplateDependencyMap } from "../../engine/templates/template-consumer.ts";
import { DataLayerTemplateDescription } from "../../engine/templates/template-interfaces.ts";
import { LdkitObjectModelTypeGenerator } from "../template-generators/ldkit/object-model-type-generator.ts";
import { GeneratedFilePathCalculator } from "../../utils/artifact-saver.ts";

export interface LdkitDalDependencyMap extends TemplateDependencyMap {
    pathResolver: GeneratedFilePathCalculator,
    ldkitSchemaArtifact: LayerArtifact,
    sparqlEndpointUri: EndpointUri,
    ldkitSchemaInterfaceArtifact: LayerArtifact
}

export class TemplateDataLayerGeneratorStrategy<TDalTemplate extends DataLayerTemplateDescription> implements DalGeneratorStrategy {

    strategyIdentifier: string = "ldkit-dal-strategy";
    private readonly _schemaProvider: SchemaProvider;
    private readonly _sparqlEndpointUri: EndpointUri;
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

        const schemaInterfaceArtifact = await new LdkitObjectModelTypeGenerator(`./types/${context.aggregate.technicalLabel}-object-model.ts`)
        .processTemplate({
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
            } as LdkitDalDependencyMap
        );

        return dataLayerTemplateArtifact;
    }
}
