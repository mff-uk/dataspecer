import { DETAIL_CAPABILITY_ID } from ".";
import { TemplateApplicationLayerGeneratorFactory } from "../app-logic-layer/generator-factory";
import { ApplicationLayerStage } from "../app-logic-layer/pipeline-stage";
import { DetailTemplateDalGeneratorFactory } from "../data-layer/generator-factory";
import { DataLayerGeneratorStage } from "../data-layer/pipeline-stage";
import { GeneratorPipeline } from "../engine/generator-pipeline";
import { PresentationLayerTemplateGeneratorFactory } from "../presentation-layer/generator-factory";
import { PresentationLayerStage } from "../presentation-layer/pipeline-stage";
import { BaseCapabilityGenerator, InstanceCapabilityMetadata } from "./capability-generator-interface";
import { CapabilityConstructorInput } from "./constructor-input";

export class DetailCapabilityMetadata extends InstanceCapabilityMetadata {

    constructor(label: string | undefined) {
        super(label ?? "Detail");
    }

    static label: string = "detail";
    getLabel = (): string => "detail";
    getIdentifier = (): string => DETAIL_CAPABILITY_ID;
}

export class DetailCapability extends BaseCapabilityGenerator {

    constructor(constructorInput: CapabilityConstructorInput) {
        super(constructorInput.structureModelMetadata, new DetailCapabilityMetadata(constructorInput.capabilityLabel));

        const dalLayerGeneratorStrategy = DetailTemplateDalGeneratorFactory.getDalGeneratorStrategy(
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