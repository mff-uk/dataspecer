import { LayerArtifact } from "../engine/layer-artifact";
import { CapabilityConfiguration, GenerationContext } from "../engine/generator-stage-interface";
import { GeneratorPipeline } from "../engine/generator-pipeline";
import { DataPsmSchema } from "@dataspecer/core/data-psm/model/data-psm-schema";

export interface CapabilityGenerator {
    generateCapability(config: CapabilityConfiguration): Promise<LayerArtifact>;
}

export class BaseCapabilityGenerator implements CapabilityGenerator {

    protected _capabilityStagesGeneratorPipeline: GeneratorPipeline = null!;    
    protected readonly _dataStructure: DataPsmSchema;
    protected readonly _aggregateName: string;

    constructor(targetDataStructure: DataPsmSchema) {
        this._dataStructure = targetDataStructure;
        this._aggregateName = this.getAggregateName(targetDataStructure);
    }

    private getAggregateName(targetDataStructure: DataPsmSchema): string {

        if (targetDataStructure.dataPsmTechnicalLabel) {
            return targetDataStructure.dataPsmTechnicalLabel;
        }

        if (!targetDataStructure.dataPsmHumanLabel ||
            Object.keys(targetDataStructure.dataPsmHumanLabel).length === 0) {
            throw new Error(`Data structure ${targetDataStructure.iri} is missing a name.`);
        }

        const labelKeys = Object.keys(targetDataStructure.dataPsmHumanLabel);

        const humanLabel = labelKeys.includes("en")
            ? targetDataStructure.dataPsmHumanLabel["en"]!
            : targetDataStructure.dataPsmHumanLabel[labelKeys.at(0)!]!;

        const aggregateName = humanLabel
            .toLowerCase()
            .replaceAll(/\s+/, "-");

        return aggregateName;
    }

    private convertToGenerationContext(config: CapabilityConfiguration): GenerationContext {
        const result: GenerationContext = {
            technicalAggregateName: this._aggregateName,

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