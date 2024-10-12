import { LayerArtifact } from "../../engine/layer-artifact";
import { DalGeneratorStrategy } from "../strategy-interface";
import { GenerationContext } from "../../engine/generator-stage-interface";
import { DataSourceType, DatasourceConfig, EndpointUri } from "../../engine/graph/datasource";
import { LdkitSchemaProvider } from "../schema-providers/ldkit-schema-provider";
import { SchemaProvider } from "../schema-providers/base-schema-provider";
import { TemplateConsumer, TemplateDependencyMap } from "../../engine/templates/template-consumer";
import { DataLayerTemplateDescription } from "../../engine/templates/template-interfaces";
import { LdkitObjectModelTypeGenerator } from "../template-generators/ldkit/object-model-type-generator";
import { GeneratedFilePathCalculator } from "../../utils/artifact-saver";

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
