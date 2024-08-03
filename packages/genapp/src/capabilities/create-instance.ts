import { TemplateApplicationLayerGeneratorFactory } from "../app-logic-layer/generator-factory";
import { ApplicationLayerStage } from "../app-logic-layer/pipeline-stage";
import { DatasourceConfig } from "../application-config";
import { CreateInstanceTemplateGeneratorFactory, DeleteInstanceTemplateGeneratorFactory } from "../data-layer/generator-factory";
import { DataLayerGeneratorStage } from "../data-layer/pipeline-stage";
import { GeneratorPipeline } from "../engine/generator-pipeline";
import { PresentationLayerTemplateGeneratorFactory } from "../presentation-layer/generator-factory";
import { PresentationLayerStage } from "../presentation-layer/list-pipeline-stage";
import { BaseCapabilityGenerator } from "./capability-generator-interface";

export class CreateInstanceCapability extends BaseCapabilityGenerator {

    constructor(targetAggregateName: string, datasourceConfig: DatasourceConfig) {
        const createCapabilityId = "create-instance";
        const dalLayerGeneratorStrategy = CreateInstanceTemplateGeneratorFactory.getDalGeneratorStrategy(datasourceConfig);
        const appLayerGeneratorStrategy = TemplateApplicationLayerGeneratorFactory.getApplicationLayerGenerator(targetAggregateName, createCapabilityId);
        const presentationLayerGeneratorStrategy = PresentationLayerTemplateGeneratorFactory.getPresentationLayerGenerator(targetAggregateName, createCapabilityId);

        super(
            targetAggregateName,
            new GeneratorPipeline(
                new DataLayerGeneratorStage(datasourceConfig, dalLayerGeneratorStrategy),
                new ApplicationLayerStage(appLayerGeneratorStrategy),
                new PresentationLayerStage(createCapabilityId, presentationLayerGeneratorStrategy)
            )
        )
    }
}