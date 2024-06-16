import { LayerArtifact } from "../engine/layer-artifact";
import { CapabilityConfiguration } from "../application-config";
import { StageGenerationContext } from "../engine/generator-stage-interface";
import { GeneratorPipeline } from "../engine/generator-pipeline";

export interface CapabilityGenerator {
    generateCapability(config: CapabilityConfiguration): Promise<LayerArtifact>;
}

export class BaseCapabilityGenerator implements CapabilityGenerator {

    private readonly _capabilityStagesGeneratorPipeline: GeneratorPipeline;
    private readonly _aggregateName: string;

    constructor(aggregateName: string, pipeline: GeneratorPipeline) {
        this._aggregateName = aggregateName;
        this._capabilityStagesGeneratorPipeline = pipeline;
    }

    protected convertConfigToCapabilityContext(config: CapabilityConfiguration): StageGenerationContext {
        const result: StageGenerationContext = {
            aggregateName: this._aggregateName,
            config: config,
            _: {} // TODO: better handle custom objects (e.g. create default StageGenerationContext instance)
        };

        return result;
    }

    generateCapability(config: CapabilityConfiguration): Promise<LayerArtifact> {
        const stageContext = this.convertConfigToCapabilityContext(config);

        const pipelineOutput = this._capabilityStagesGeneratorPipeline.generateStages(stageContext);
        return pipelineOutput;
    }

}