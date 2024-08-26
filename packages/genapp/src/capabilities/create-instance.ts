import { TemplateApplicationLayerGeneratorFactory } from "../app-logic-layer/generator-factory";
import { ApplicationLayerStage } from "../app-logic-layer/pipeline-stage";
import { DatasourceConfig, Iri } from "../application-config";
import { CreateInstanceTemplateGeneratorFactory, DeleteInstanceTemplateGeneratorFactory } from "../data-layer/generator-factory";
import { DataLayerGeneratorStage } from "../data-layer/pipeline-stage";
import { GeneratorPipeline } from "../engine/generator-pipeline";
import { PresentationLayerTemplateGeneratorFactory } from "../presentation-layer/generator-factory";
import { PresentationLayerStage } from "../presentation-layer/list-pipeline-stage";
import { BaseCapabilityGenerator } from "./capability-generator-interface";

export class CreateInstanceCapability extends BaseCapabilityGenerator {

    public static readonly identifier: string = "https://dataspecer.com/application_graph/capability/create-instance";

    constructor(aggregateIri: Iri, datasourceConfig: DatasourceConfig) {
        super(aggregateIri);

        const dalLayerGeneratorStrategy = CreateInstanceTemplateGeneratorFactory.getDalGeneratorStrategy(datasourceConfig);
        const appLayerGeneratorStrategy = TemplateApplicationLayerGeneratorFactory.getApplicationLayerGenerator(
            aggregateIri,
            CreateInstanceCapability.identifier
        );
        const presentationLayerGeneratorStrategy = PresentationLayerTemplateGeneratorFactory.getPresentationLayerGenerator(
            aggregateIri,
            CreateInstanceCapability.identifier
        );

        this._capabilityStagesGeneratorPipeline = new GeneratorPipeline(
            new DataLayerGeneratorStage(datasourceConfig, dalLayerGeneratorStrategy),
            new ApplicationLayerStage(appLayerGeneratorStrategy),
            new PresentationLayerStage(CreateInstanceCapability.identifier, presentationLayerGeneratorStrategy)
        );
    }
}