import { TemplateApplicationLayerGeneratorFactory } from "../app-logic-layer/generator-factory";
import { ApplicationLayerStage } from "../app-logic-layer/pipeline-stage";
import { DatasourceConfig } from "../application-config";
import { DeleteInstanceTemplateGeneratorFactory } from "../data-layer/generator-factory";
import { DataLayerGeneratorStage } from "../data-layer/pipeline-stage";
import { GeneratorPipeline } from "../engine/generator-pipeline";
import { BaseCapabilityGenerator } from "./capability-generator-interface";

export class DeleteInstanceCapability extends BaseCapabilityGenerator {

    constructor(targetAggregateName: string, datasourceConfig: DatasourceConfig) {
        const detailCapabilityId = "delete-instance";
        const dalLayerGeneratorStrategy = DeleteInstanceTemplateGeneratorFactory.getDalGeneratorStrategy(datasourceConfig);
        const appLayerGeneratorStrategy = TemplateApplicationLayerGeneratorFactory.getApplicationLayerGenerator(targetAggregateName, detailCapabilityId);
        //const presentationLayerGeneratorStrategy = PresentationLayerTemplateGeneratorFactory.getPresentationLayerGenerator(targetAggregateName, detailCapabilityId);
        super(
            targetAggregateName,
            new GeneratorPipeline(
                new DataLayerGeneratorStage(datasourceConfig, dalLayerGeneratorStrategy),
                new ApplicationLayerStage(appLayerGeneratorStrategy)
                //new PresentationLayerStage(detailCapabilityId, presentationLayerGeneratorStrategy)
            )
        )
    }
}