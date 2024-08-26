import { LayerArtifact } from "../engine/layer-artifact";
import { CapabilityConfiguration, Iri } from "../application-config";
import { StageGenerationContext } from "../engine/generator-stage-interface";
import { GeneratorPipeline } from "../engine/generator-pipeline";

export interface CapabilityGenerator {
    generateCapability(config: CapabilityConfiguration): Promise<LayerArtifact>;
}

export type AggregateStructureMetadata = {
    iri: Iri;
    rootClassIri: Iri;
    humanLabel: string;
    technicalLabel: string;
}

export class BaseCapabilityGenerator implements CapabilityGenerator {

    protected _capabilityStagesGeneratorPipeline: GeneratorPipeline = null!;
    protected readonly _aggregateMetadata: AggregateStructureMetadata;
    private readonly _aggregateIri: string;

    constructor(aggregateIri: Iri) {
        this._aggregateIri = aggregateIri;
        this._aggregateMetadata = {
            iri: aggregateIri,
            rootClassIri: "http://dataspecer.com/sample/root/class/iri",
            humanLabel: "<Sample Data Structure>",
            technicalLabel: "sample_data_structure"
        } as AggregateStructureMetadata;
    }

    protected convertConfigToCapabilityContext(config: CapabilityConfiguration): StageGenerationContext {
        const result: StageGenerationContext = {
            aggregateName: this._aggregateIri,
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