import { CREATE_CAPABILITY_ID } from "./index.ts";
import { TemplateApplicationLayerGeneratorFactory } from "../app-logic-layer/generator-factory.ts";
import { ApplicationLayerStage } from "../app-logic-layer/pipeline-stage.ts";
import { CreateInstanceTemplateGeneratorFactory } from "../data-layer/generator-factory.ts";
import { DataLayerGeneratorStage } from "../data-layer/pipeline-stage.ts";
import { GeneratorPipeline } from "../engine/generator-pipeline.ts";
import { PresentationLayerTemplateGeneratorFactory } from "../presentation-layer/generator-factory.ts";
import { PresentationLayerStage } from "../presentation-layer/pipeline-stage.ts";
import { AggregateCapabilityMetadata, BaseCapabilityGenerator } from "./capability-generator-interface.ts";
import { CapabilityConstructorInput } from "./constructor-input.ts";

export class CreateInstanceCapabilityMetadata extends AggregateCapabilityMetadata {

    constructor(humanLabel: string | undefined) {
        super(humanLabel ?? "Create New");
    }

    static label: string = "create-instance";
    getLabel = (): string => "create-instance";
    getIdentifier = (): string => CREATE_CAPABILITY_ID;
}

export class CreateInstanceCapability extends BaseCapabilityGenerator {

    constructor(constructorInput: CapabilityConstructorInput) {
        super(constructorInput.structureModelMetadata, new CreateInstanceCapabilityMetadata(constructorInput.capabilityLabel));

        const dalLayerGeneratorStrategy = CreateInstanceTemplateGeneratorFactory.getDalGeneratorStrategy(
            constructorInput.structureModelMetadata.technicalLabel,
            constructorInput.structureModelMetadata.specificationIri,
            constructorInput.datasource
        );
        const appLayerGeneratorStrategy = TemplateApplicationLayerGeneratorFactory.getApplicationLayerGenerator(
            constructorInput.structureModelMetadata.technicalLabel,
            this.getIdentifier()
        );
        const presentationLayerGeneratorStrategy = PresentationLayerTemplateGeneratorFactory.getPresentationLayerGenerator(
            constructorInput.structureModelMetadata,
            this.getIdentifier()
        );

        this._capabilityStagesGeneratorPipeline = new GeneratorPipeline(
            new DataLayerGeneratorStage(dalLayerGeneratorStrategy),
            new ApplicationLayerStage(appLayerGeneratorStrategy),
            new PresentationLayerStage(this.getLabel(), presentationLayerGeneratorStrategy)
        );
    }
}