import { LayerArtifact } from "../engine/layer-artifact";
import { CapabilityConfiguration, GenerationContext } from "../engine/generator-stage-interface";
import { GeneratorPipeline } from "../engine/generator-pipeline";
import { AggregateMetadata } from "../application-config";

export interface CapabilityGenerator {
    getType(): string;
    getCapabilityLabel(): string;
    generateCapability(config: CapabilityConfiguration): Promise<LayerArtifact>;
}

abstract class BaseCapabilityGenerator implements CapabilityGenerator {

    protected _capabilityStagesGeneratorPipeline: GeneratorPipeline = null!;
    protected readonly _aggregateMetadata: AggregateMetadata;

    constructor(aggregateMetadata: AggregateMetadata) {
        this._aggregateMetadata = aggregateMetadata;
    }

    abstract getCapabilityLabel(): string;
    abstract getType(): string;

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

export abstract class InstanceTypeCapabilityGenerator extends BaseCapabilityGenerator {
    getType = (): string => "instance";
}

export abstract class AggregateTypeCapabilityGenerator extends BaseCapabilityGenerator {
    getType = (): string => "collection";
}
