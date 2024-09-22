
import { DELETE_CAPABILITY_ID } from ".";
import { TemplateApplicationLayerGeneratorFactory } from "../app-logic-layer/generator-factory";
import { ApplicationLayerStage } from "../app-logic-layer/pipeline-stage";
import { DeleteInstanceTemplateGeneratorFactory } from "../data-layer/generator-factory";
import { DataLayerGeneratorStage } from "../data-layer/pipeline-stage";
import { GeneratorPipeline } from "../engine/generator-pipeline";
import { PresentationLayerTemplateGeneratorFactory } from "../presentation-layer/generator-factory";
import { PresentationLayerStage } from "../presentation-layer/pipeline-stage";
import { BaseCapabilityGenerator, InstanceCapabilityMetadata } from "./capability-generator-interface";
import { CapabilityConstructorInput } from "./constructor-input";

export class DeleteInstanceCapabilityMetadata extends InstanceCapabilityMetadata {

    constructor(humanLabel: string | undefined) {
        super(humanLabel ?? "Delete Instance");
    }

    static label: string = "delete-instance";
    getLabel = (): string => "delete-instance";
    getIdentifier = (): string => DELETE_CAPABILITY_ID;
}

export class DeleteInstanceCapability extends BaseCapabilityGenerator {

    constructor(constructorInput: CapabilityConstructorInput) {
        super(constructorInput.dataStructureMetadata, new DeleteInstanceCapabilityMetadata(constructorInput.capabilityLabel));

        const dalLayerGeneratorStrategy = DeleteInstanceTemplateGeneratorFactory.getDalGeneratorStrategy(constructorInput.dataStructureMetadata.specificationIri, constructorInput.datasource);
        const appLayerGeneratorStrategy = TemplateApplicationLayerGeneratorFactory.getApplicationLayerGenerator(
            constructorInput.dataStructureMetadata.technicalLabel,
            this.getIdentifier()
        );

        const presentationLayerGeneratorStrategy = PresentationLayerTemplateGeneratorFactory
            .getPresentationLayerGenerator(
                constructorInput.dataStructureMetadata,
                this.getIdentifier()
            );

        this._capabilityStagesGeneratorPipeline = new GeneratorPipeline(
            new DataLayerGeneratorStage(dalLayerGeneratorStrategy),
            new ApplicationLayerStage(appLayerGeneratorStrategy),
            new PresentationLayerStage(this.getLabel(), presentationLayerGeneratorStrategy)
        );
    }
}
