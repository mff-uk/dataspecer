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

/**
 * Represents metadata for the detail capability such as its identifier and label.
 * @class DetailCapabilityMetadata
 * @extends {InstanceCapabilityMetadata}
 */
export class DetailCapabilityMetadata extends InstanceCapabilityMetadata {

    constructor(label: string | undefined) {
        super(label ?? "Detail");
    }

    static label: string = "detail";
    getLabel = (): string => "detail";
    getIdentifier = (): string => DETAIL_CAPABILITY_ID;
}

/**
 * This class acts as a definition for the detail capability, i.e. the capability to get and return detailed view of a corresponding instance.
 * The purpose of this class is to provide the `BaseCapabilityGenerator` with the layers required for the detail capability to be generated.
 *
 * @remarks
 * This class initializes the capability stages generator pipeline with
 * data layer, application layer and presentation layer.
 */
export class DetailCapability extends BaseCapabilityGenerator {

    constructor(constructorInput: CapabilityConstructorInput) {
        super(constructorInput.structureModelMetadata, new DetailCapabilityMetadata(constructorInput.capabilityLabel));

        // instantiates the data layer generator based from the configuration-provided datasource
        const dalLayerGeneratorStrategy = DetailTemplateDalGeneratorFactory.getDalGeneratorStrategy(
            constructorInput.structureModelMetadata.technicalLabel,
            constructorInput.structureModelMetadata.specificationIri,
            constructorInput.datasource
        );

        // instantiates the detail application layer generator based on the capability identifier
        const appLayerGeneratorStrategy = TemplateApplicationLayerGeneratorFactory.getApplicationLayerGenerator(
            constructorInput.structureModelMetadata.technicalLabel,
            this.getIdentifier()
        );

        // instantiates the detail presentation layer generator based on the capability identifier
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