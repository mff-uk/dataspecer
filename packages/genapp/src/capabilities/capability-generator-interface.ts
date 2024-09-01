import { LayerArtifact } from "../engine/layer-artifact";
import { CapabilityConfiguration, GenerationContext } from "../engine/generator-stage-interface";
import { GeneratorPipeline } from "../engine/generator-pipeline";
import { AggregateMetadata } from "../application-config";

export interface CapabilityGenerator {
    generateCapability(config: CapabilityConfiguration): Promise<LayerArtifact>;
}

export class BaseCapabilityGenerator implements CapabilityGenerator {

    protected _capabilityStagesGeneratorPipeline: GeneratorPipeline = null!;    
    protected readonly _aggregateMetadata: AggregateMetadata;

    constructor(aggregateMetadata: AggregateMetadata) {
        this._aggregateMetadata = aggregateMetadata;
    }

    private convertToGenerationContext(config: CapabilityConfiguration): GenerationContext {
        const result: GenerationContext = {
            aggregate: config.aggregate,

            // should not be needed
            graph: config.graph,
            currentNode: config.node,

            // capability info
            config: config.config,
            _: {}
        };

        return result;
    }

    generateCapability(config: CapabilityConfiguration): Promise<LayerArtifact> {
        const generationContext = this.convertToGenerationContext(config);

        return this
            ._capabilityStagesGeneratorPipeline
            .generateStages(generationContext);
    }
}