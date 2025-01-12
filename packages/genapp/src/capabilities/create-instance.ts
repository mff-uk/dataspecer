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

/**
 * Represents metadata for the instance creation capability such as its identifier and label.
 * @class CreateInstanceCapabilityMetadata
 * @extends {AggregateCapabilityMetadata}
 */
export class CreateInstanceCapabilityMetadata extends AggregateCapabilityMetadata {

    constructor(humanLabel: string | undefined) {
        super(humanLabel ?? "Create New");
    }

    static label: string = "create-instance";
    getLabel = (): string => "create-instance";
    getIdentifier = (): string => CREATE_CAPABILITY_ID;
}

/**
 * This class acts as a definition for the "instance creation" capability, i.e. the capability to create new instance of a corresponding class.
 * The purpose of this class is to provide the `BaseCapabilityGenerator` with the layers required for the creation capability to be generated.
 *
 * @remarks
 * This class initializes the capability stages generator pipeline with
 * data layer, application layer and presentation layer.
 */
export class CreateInstanceCapability extends BaseCapabilityGenerator {

    constructor(constructorInput: CapabilityConstructorInput) {
        super(constructorInput.structureModelMetadata, new CreateInstanceCapabilityMetadata(constructorInput.capabilityLabel));

        // instantiates the data layer generator based from the configuration-provided datasource
        const dalLayerGeneratorStrategy = CreateInstanceTemplateGeneratorFactory.getDalGeneratorStrategy(
            constructorInput.structureModelMetadata.technicalLabel,
            constructorInput.structureModelMetadata.specificationIri,
            constructorInput.datasource
        );

        // instantiates the instance creation application layer generator based on the capability identifier
        const appLayerGeneratorStrategy = TemplateApplicationLayerGeneratorFactory.getApplicationLayerGenerator(
            constructorInput.structureModelMetadata.technicalLabel,
            this.getIdentifier()
        );

        // instantiates the instance creation presentation layer generator based on the capability identifier
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