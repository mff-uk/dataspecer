import { LayerArtifact } from "../engine/layer-artifact";
import { CapabilityConfiguration, StageGenerationContext } from "../engine/generator-stage-interface";
import { GeneratorPipeline } from "../engine/generator-pipeline";

export interface CapabilityGenerator {
    generateCapability(config: CapabilityConfiguration): Promise<LayerArtifact>;
}

export class BaseCapabilityGenerator implements CapabilityGenerator {

    protected _capabilityStagesGeneratorPipeline: GeneratorPipeline = null!;
    protected readonly _structureIri: string;
    private readonly _aggregateName: string;


    constructor(aggregateName: string, structureIri: string) {
        this._aggregateName = aggregateName;
        this._structureIri = structureIri;
    }

    protected convertConfigToCapabilityContext(config: CapabilityConfiguration): StageGenerationContext {
        const result: StageGenerationContext = {
            // get from graph node / dataspecer structure info
            aggregateName: this._aggregateName,
            // should not be needed
            graph: config.graph,
            currentNode: config.currentNode,

            // capability info
            config: config.config,
            _: {}
        };

        return result;
    }

    generateCapability(config: CapabilityConfiguration): Promise<LayerArtifact> {
        const stageContext = this.convertConfigToCapabilityContext(config);

        const pipelineOutput = this._capabilityStagesGeneratorPipeline.generateStages(stageContext);
        return pipelineOutput;
    }
}