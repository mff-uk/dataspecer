import { TemplateApplicationLayerGeneratorFactory } from "../app-logic-layer/generator-factory";
import { ApplicationLayerStage } from "../app-logic-layer/pipeline-stage";
import { DetailTemplateDalGeneratorFactory } from "../data-layer/generator-factory";
import { DataLayerGeneratorStage } from "../data-layer/pipeline-stage";
import { GeneratorPipeline } from "../engine/generator-pipeline";
import { PresentationLayerTemplateGeneratorFactory } from "../presentation-layer/generator-factory";
import { PresentationLayerStage } from "../presentation-layer/pipeline-stage";
import { BaseCapabilityGenerator } from "./capability-generator-interface";
import { CapabilityConstructorInput } from "./constructor-input";

export class DetailCapability extends BaseCapabilityGenerator {

    public static readonly label: string = "detail";
    public static readonly identifier: string = `https://dataspecer.com/application_graph/capability/${this.label}`;

    constructor(constructorInput: CapabilityConstructorInput) {
        super(constructorInput.dataStructure);

        const dalLayerGeneratorStrategy = DetailTemplateDalGeneratorFactory.getDalGeneratorStrategy(constructorInput.datasource);
        const appLayerGeneratorStrategy = TemplateApplicationLayerGeneratorFactory.getApplicationLayerGenerator(
            this._aggregateName,
            DetailCapability.identifier
        );
        const presentationLayerGeneratorStrategy = PresentationLayerTemplateGeneratorFactory.getPresentationLayerGenerator(
            this._aggregateName,
            DetailCapability.identifier
        );

        this._capabilityStagesGeneratorPipeline = new GeneratorPipeline(
            new DataLayerGeneratorStage(constructorInput.datasource, dalLayerGeneratorStrategy),
            new ApplicationLayerStage(appLayerGeneratorStrategy),
            new PresentationLayerStage(DetailCapability.label, presentationLayerGeneratorStrategy)
        );
    }
}