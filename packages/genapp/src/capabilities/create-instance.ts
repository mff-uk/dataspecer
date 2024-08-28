import { TemplateApplicationLayerGeneratorFactory } from "../app-logic-layer/generator-factory";
import { ApplicationLayerStage } from "../app-logic-layer/pipeline-stage";
import { DatasourceConfig } from "../application-config";
import { CreateInstanceTemplateGeneratorFactory, DeleteInstanceTemplateGeneratorFactory } from "../data-layer/generator-factory";
import { DataLayerGeneratorStage } from "../data-layer/pipeline-stage";
import { GeneratorPipeline } from "../engine/generator-pipeline";
import { PresentationLayerTemplateGeneratorFactory } from "../presentation-layer/generator-factory";
import { PresentationLayerStage } from "../presentation-layer/pipeline-stage";
import { BaseCapabilityGenerator } from "./capability-generator-interface";
import { CapabilityConstructorInput } from "./constructor-input";

export class CreateInstanceCapability extends BaseCapabilityGenerator {

    public static readonly label: string = "create-instance";
    public static readonly identifier: string = `https://dataspecer.com/application_graph/capability/${this.label}`;

    constructor(constructorInput: CapabilityConstructorInput) {
        super(constructorInput.rootLabel, constructorInput.rootStructureIri);

        const dalLayerGeneratorStrategy = CreateInstanceTemplateGeneratorFactory.getDalGeneratorStrategy(constructorInput.datasource);
        const appLayerGeneratorStrategy = TemplateApplicationLayerGeneratorFactory.getApplicationLayerGenerator(
            constructorInput.rootLabel,
            CreateInstanceCapability.identifier
        );
        const presentationLayerGeneratorStrategy = PresentationLayerTemplateGeneratorFactory.getPresentationLayerGenerator(
            constructorInput.rootLabel,
            CreateInstanceCapability.identifier
        );

        this._capabilityStagesGeneratorPipeline = new GeneratorPipeline(
            new DataLayerGeneratorStage(constructorInput.datasource, dalLayerGeneratorStrategy),
            new ApplicationLayerStage(appLayerGeneratorStrategy),
            new PresentationLayerStage(CreateInstanceCapability.identifier, presentationLayerGeneratorStrategy)
        );
    }
}