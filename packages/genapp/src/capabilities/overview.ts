import { ListCapabilityApplicationLayerStage } from "../app-logic-layer/list-app-pipeline-stage";
import { CapabilityConfiguration, DatasourceConfig } from "../application-config";
import { DataLayerGeneratorStage } from "../data-layer/dal-pipeline-stage";
import { GeneratorPipeline } from "../engine/generator-pipeline";
import { StageGenerationContext } from "../engine/generator-stage-interface";
import { LayerArtifact } from "../engine/layer-artifact";
import { PresentationLayerStage } from "../presentation-layer/list-pipeline-stage";
import { CapabilityGenerator } from "./capability-definition";

export class OverviewCapability implements CapabilityGenerator {

    identifier: string = "overview";
    private readonly _pipeline: GeneratorPipeline;
    private readonly _aggregateName: string;

    constructor(targetAggregateName: string, datasourceConfig: DatasourceConfig) {
        this._aggregateName = targetAggregateName;
        this._pipeline = new GeneratorPipeline(
            new DataLayerGeneratorStage(datasourceConfig),
            new ListCapabilityApplicationLayerStage(),
            new PresentationLayerStage()
        );
    }

    private convertConfigToCapabilityContext(config: CapabilityConfiguration): StageGenerationContext {
        const result: StageGenerationContext = {
            aggregateName: this._aggregateName,
            config: config,
            _: {} // TODO: better handle custom objects (e.g. create default StageGenerationContext instance)
        };

        return result;
    }

    generateCapability(config: CapabilityConfiguration): Promise<LayerArtifact> {

        const stageContext = this.convertConfigToCapabilityContext(config);

        const pipelineOutput = this._pipeline.generateStages(stageContext);

        console.log(pipelineOutput);

        return pipelineOutput;
    }
}
