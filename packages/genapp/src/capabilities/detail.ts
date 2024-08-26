import { TemplateApplicationLayerGeneratorFactory } from "../app-logic-layer/generator-factory";
import { ApplicationLayerStage } from "../app-logic-layer/pipeline-stage";
import { Datasource, Iri } from "../application-config";
import { DetailTemplateDalGeneratorFactory } from "../data-layer/generator-factory";
import { DataLayerGeneratorStage } from "../data-layer/pipeline-stage";
import { GeneratorPipeline } from "../engine/generator-pipeline";
import { PresentationLayerTemplateGeneratorFactory } from "../presentation-layer/generator-factory";
import { PresentationLayerStage } from "../presentation-layer/list-pipeline-stage";
import { BaseCapabilityGenerator } from "./capability-generator-interface";

export class DetailCapability extends BaseCapabilityGenerator {

    public static readonly identifier: string = "https://dataspecer.com/application_graph/capability/detail";

    constructor(aggregateIri: Iri, datasourceConfig: Datasource) {
        super(aggregateIri);

        const dalLayerGeneratorStrategy = DetailTemplateDalGeneratorFactory.getDalGeneratorStrategy(datasourceConfig);
        const appLayerGeneratorStrategy = TemplateApplicationLayerGeneratorFactory.getApplicationLayerGenerator(
            aggregateIri,
            DetailCapability.identifier
        );
        const presentationLayerGeneratorStrategy = PresentationLayerTemplateGeneratorFactory.getPresentationLayerGenerator(
            aggregateIri,
            DetailCapability.identifier
        );

        this._capabilityStagesGeneratorPipeline = new GeneratorPipeline(
            new DataLayerGeneratorStage(datasourceConfig, dalLayerGeneratorStrategy),
            new ApplicationLayerStage(appLayerGeneratorStrategy),
            new PresentationLayerStage(DetailCapability.identifier, presentationLayerGeneratorStrategy)
        );
    }
}