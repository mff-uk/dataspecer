import { CREATE_CAPABILITY_ID } from ".";
import { TemplateApplicationLayerGeneratorFactory } from "../app-logic-layer/generator-factory";
import { ApplicationLayerStage } from "../app-logic-layer/pipeline-stage";
import { CreateInstanceTemplateGeneratorFactory } from "../data-layer/generator-factory";
import { DataLayerGeneratorStage } from "../data-layer/pipeline-stage";
import { GeneratorPipeline } from "../engine/generator-pipeline";
import { PresentationLayerTemplateGeneratorFactory } from "../presentation-layer/generator-factory";
import { PresentationLayerStage } from "../presentation-layer/pipeline-stage";
import { AggregateCapabilityMetadata, BaseCapabilityGenerator } from "./capability-generator-interface";
import { CapabilityConstructorInput } from "./constructor-input";

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
        super(constructorInput.dataStructureMetadata, new CreateInstanceCapabilityMetadata(constructorInput.capabilityLabel));

        const dalLayerGeneratorStrategy = CreateInstanceTemplateGeneratorFactory.getDalGeneratorStrategy(constructorInput.dataStructureMetadata.specificationIri, constructorInput.datasource);
        const appLayerGeneratorStrategy = TemplateApplicationLayerGeneratorFactory.getApplicationLayerGenerator(
            constructorInput.dataStructureMetadata.technicalLabel,
            this.getIdentifier()
        );
        const presentationLayerGeneratorStrategy = PresentationLayerTemplateGeneratorFactory.getPresentationLayerGenerator(
            constructorInput.dataStructureMetadata,
            this.getIdentifier()
        );

        this._capabilityStagesGeneratorPipeline = new GeneratorPipeline(
            new DataLayerGeneratorStage(constructorInput.saveBasePath, dalLayerGeneratorStrategy),
            new ApplicationLayerStage(constructorInput.saveBasePath, appLayerGeneratorStrategy),
            new PresentationLayerStage(constructorInput.saveBasePath, this.getLabel(), presentationLayerGeneratorStrategy)
        );
    }
}