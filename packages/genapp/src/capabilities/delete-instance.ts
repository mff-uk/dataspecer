
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

/**
 * Represents metadata for the deletion capability such as its identifier and label.
 * @class DeleteInstanceCapabilityMetadata
 * @extends {InstanceCapabilityMetadata}
 */
export class DeleteInstanceCapabilityMetadata extends InstanceCapabilityMetadata {

    constructor(humanLabel: string | undefined) {
        super(humanLabel ?? "Delete Instance");
    }

    static label: string = "delete-instance";
    getLabel = (): string => "delete-instance";
    getIdentifier = (): string => DELETE_CAPABILITY_ID;
}

/**
 * This class acts as a definition for the "instance deletion" capability, i.e. the capability to delete an instance of a corresponding class.
 * The purpose of this class is to provide the `BaseCapabilityGenerator` with the layers required for the deletion capability to be generated.
 *
 * @remarks
 * This class initializes the capability stages generator pipeline with
 * data layer, application layer and presentation layer.
 */
export class DeleteInstanceCapability extends BaseCapabilityGenerator {

    constructor(constructorInput: CapabilityConstructorInput) {
        super(constructorInput.structureModelMetadata, new DeleteInstanceCapabilityMetadata(constructorInput.capabilityLabel));

        // instantiates the data layer generator based from the configuration-provided datasource
        const dalLayerGeneratorStrategy = DeleteInstanceTemplateGeneratorFactory.getDalGeneratorStrategy(
            constructorInput.structureModelMetadata.technicalLabel,
            constructorInput.structureModelMetadata.specificationIri,
            constructorInput.datasource
        );

        // instantiates the deletion application layer generator based on the capability identifier
        const appLayerGeneratorStrategy = TemplateApplicationLayerGeneratorFactory.getApplicationLayerGenerator(
            constructorInput.structureModelMetadata.technicalLabel,
            this.getIdentifier()
        );

        // instantiates the deletion presentation layer generator based on the capability identifier
        const presentationLayerGeneratorStrategy = PresentationLayerTemplateGeneratorFactory
            .getPresentationLayerGenerator(
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
