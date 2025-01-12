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

/**
 * Interface representing the dependencies needed to generate the LDkit data access layer.
 *
 * @interface LdkitDalDependencyMap
 * @extends TemplateDependencyMap
 *
 * @property {GeneratedFilePathCalculator} pathResolver - A utility to calculate relative file paths for generated files.
 * @property {LayerArtifact} ldkitSchemaArtifact - The artifact representing the LDkit schema for an aggregate.
 * @property {EndpointUri} sparqlEndpointUri - The URI of the SPARQL endpoint where RDF data are accessible.
 * @property {LayerArtifact} ldkitSchemaInterfaceArtifact - The artifact representing the LDkit schema interface.
 */
export interface LdkitDalDependencyMap extends TemplateDependencyMap {
    pathResolver: GeneratedFilePathCalculator,
    ldkitSchemaArtifact: LayerArtifact,
    sparqlEndpointUri: EndpointUri,
    ldkitSchemaInterfaceArtifact: LayerArtifact
}

/**
 * Strategy for generating RDF-based data layer using the template approach.
 * This strategy is designed to work with RDF data sources and uses schema provider to
 * retrieve the necessary data schema needed for template population.
 *
 * @template TDalTemplate - The type of the data layer template.
 * @implements {DalGeneratorStrategy}
 */
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

    /**
     * Generates the RDF-based data layer for an aggregate using the template population approach. First, the data schema
     * is retrieved from the schema provider. The retrieved schema is then used to populate the template as well as for
     * aggregate interface generation.
     *
     * @param context - The context for generation, containing the aggregate data as well as the application graph context.
     * @returns A promise that resolves to a LayerArtifact representing the generated data layer.
     */
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
