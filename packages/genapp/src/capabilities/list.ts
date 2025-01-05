import { LIST_CAPABILITY_ID } from ".";
import { TemplateApplicationLayerGeneratorFactory } from "../app-logic-layer/generator-factory";
import { ApplicationLayerStage } from "../app-logic-layer/pipeline-stage";
import { ListTemplateDalGeneratorFactory } from "../data-layer/generator-factory";
import { DataLayerGeneratorStage } from "../data-layer/pipeline-stage";
import { GeneratorPipeline } from "../engine/generator-pipeline";
import { PresentationLayerTemplateGeneratorFactory } from "../presentation-layer/generator-factory";
import { PresentationLayerStage } from "../presentation-layer/pipeline-stage";
import { AggregateCapabilityMetadata, BaseCapabilityGenerator } from "./capability-generator-interface";
import { CapabilityConstructorInput } from "./constructor-input";

export class ListCapabilityMetadata extends AggregateCapabilityMetadata {
    constructor(humanLabel: string | undefined) {
        super(humanLabel ?? "List");
    }

    static label: string = "list";
    getLabel = (): string => "list";
    getIdentifier = (): string => LIST_CAPABILITY_ID;
}

/**
 * This class acts as a definition for list capability, i.e. the capability to get and return instances of a corresponding data items.
 * The purpose of this class is to provide the `BaseCapabilityGenerator` with the layers required for the list capability to be generated.
 * In order to provide the layers, list-and-layer-specific generators are being constructed.
 *
 * @remarks
 * This class initializes the capability stages generator pipeline with
 * data layer, application layer and presentation layer.
 */
export class ListCapability extends BaseCapabilityGenerator {

    constructor(constructorInput: CapabilityConstructorInput) {
        super(constructorInput.structureModelMetadata, new ListCapabilityMetadata(constructorInput.capabilityLabel));

        // instantiates the data layer generator based from the configuration-provided datasource
        const dalLayerGeneratorStrategy = ListTemplateDalGeneratorFactory.getDalGeneratorStrategy(
            constructorInput.structureModelMetadata.technicalLabel,
            constructorInput.structureModelMetadata.specificationIri,
            constructorInput.datasource
        );

        // instantiates the list application layer generator based on the list capability identifier
        const appLayerGeneratorStrategy = TemplateApplicationLayerGeneratorFactory.getApplicationLayerGenerator(
            constructorInput.structureModelMetadata.technicalLabel,
            this.getIdentifier()
        );

        // instantiates the list presentation layer generator based on the list capability identifier
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
