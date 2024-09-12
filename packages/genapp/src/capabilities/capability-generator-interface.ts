import { LayerArtifact } from "../engine/layer-artifact";
import { CapabilityConfiguration, GenerationContext } from "../engine/generator-stage-interface";
import { GeneratorPipeline } from "../engine/generator-pipeline";
import { AggregateMetadata } from "../application-config";
import { CAPABILITY_BASE_IRI, CapabilityType } from ".";

export interface CapabilityGeneratorMetadata {
    getType(): CapabilityType;
    getLabel(): string;
    getHumanLabel(): string;
    getIdentifier(): string;
}

export abstract class InstanceCapabilityMetadata implements CapabilityGeneratorMetadata {
    abstract getLabel(): string;
    abstract getHumanLabel(): string;

    getType = (): CapabilityType => CapabilityType.Instance;
    getIdentifier = () : string => CAPABILITY_BASE_IRI + this.getLabel();
}

export abstract class AggregateCapabilityMetadata implements CapabilityGeneratorMetadata{
    abstract getLabel(): string;
    abstract getHumanLabel(): string;

    getType = (): CapabilityType => CapabilityType.Collection;
    getIdentifier = () : string => CAPABILITY_BASE_IRI + this.getLabel();
}

export interface CapabilityGenerator extends CapabilityGeneratorMetadata {
    generateCapability(config: CapabilityConfiguration): Promise<LayerArtifact>;
}

export class BaseCapabilityGenerator implements CapabilityGenerator, CapabilityGeneratorMetadata {

    private readonly _capabilityMetadata: CapabilityGeneratorMetadata;
    protected _capabilityStagesGeneratorPipeline: GeneratorPipeline = null!;
    protected readonly _aggregateMetadata: AggregateMetadata;

    constructor(aggregateMetadata: AggregateMetadata, capabilityMetadata: CapabilityGeneratorMetadata) {
        this._aggregateMetadata = aggregateMetadata;
        this._capabilityMetadata = capabilityMetadata;
    }

    getType = (): CapabilityType => this._capabilityMetadata.getType();
    getLabel = (): string => this._capabilityMetadata.getLabel();
    getIdentifier = (): string => this._capabilityMetadata.getIdentifier();
    getHumanLabel = (): string => this._capabilityMetadata.getHumanLabel();

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
