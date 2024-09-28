import { LayerArtifact } from "../engine/layer-artifact";
import { GenerationContext } from "../engine/generator-stage-interface";
import { GeneratorPipeline } from "../engine/generator-pipeline";
import { AggregateMetadata } from "../application-config";
import { CapabilityType } from ".";
import { ApplicationGraph, ApplicationGraphNode, NodeConfiguration } from "../engine/graph";

export interface CapabilityGeneratorMetadata {
    getType(): CapabilityType;
    getLabel(): string;
    getHumanLabel(): string;
    getIdentifier(): string;
}

interface CapabilityConfiguration {
    aggregate: AggregateMetadata,
    graph: ApplicationGraph;
    node: ApplicationGraphNode;
    nodeConfig: NodeConfiguration;
}

export abstract class InstanceCapabilityMetadata implements CapabilityGeneratorMetadata {
    abstract getLabel(): string;
    abstract getIdentifier(): string;

    private readonly _humanLabel: string;

    constructor(label: string) {
        this._humanLabel = label;
    }

    getType = (): CapabilityType => CapabilityType.Instance;
    getHumanLabel = (): string => this._humanLabel;
}

export abstract class AggregateCapabilityMetadata implements CapabilityGeneratorMetadata{
    abstract getLabel(): string;
    abstract getIdentifier(): string;

    private readonly _humanLabel: string;

    constructor(label: string) {
        this._humanLabel = label;
    }

    getHumanLabel = (): string => this._humanLabel;
    getType = (): CapabilityType => CapabilityType.Collection;
}

export interface CapabilityGenerator extends CapabilityGeneratorMetadata {
    generateCapability(config: CapabilityConfiguration): Promise<LayerArtifact>;
}

export abstract class BaseCapabilityGenerator implements CapabilityGenerator, CapabilityGeneratorMetadata {

    private readonly _capabilityMetadata: CapabilityGeneratorMetadata;
    protected _capabilityStagesGeneratorPipeline: GeneratorPipeline = null!;
    protected readonly _aggregateMetadata: AggregateMetadata;

    constructor(aggregateMetadata: AggregateMetadata, capabilityMetadata: CapabilityGeneratorMetadata) {
        this._aggregateMetadata = aggregateMetadata;
        this._capabilityMetadata = capabilityMetadata;
    }

    getLabel = (): string => this._capabilityMetadata.getLabel();
    getType = (): CapabilityType => this._capabilityMetadata.getType();
    getIdentifier = (): string => this._capabilityMetadata.getIdentifier();
    getHumanLabel = (): string => this._capabilityMetadata.getHumanLabel();

    private convertToGenerationContext(config: CapabilityConfiguration): GenerationContext {
        const result: GenerationContext = {
            aggregate: config.aggregate,
            graph: config.graph,
            currentNode: config.node,
            config: config.nodeConfig,
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
