import { TemplateApplicationLayerGeneratorFactory } from "../app-logic-layer/generator-factory";
import { ApplicationLayerStage } from "../app-logic-layer/pipeline-stage";
import { CreateInstanceTemplateGeneratorFactory } from "../data-layer/generator-factory";
import { DataLayerGeneratorStage } from "../data-layer/pipeline-stage";
import { GeneratorPipeline } from "../engine/generator-pipeline";
import { PresentationLayerTemplateGeneratorFactory } from "../presentation-layer/generator-factory";
import { PresentationLayerStage } from "../presentation-layer/pipeline-stage";
import { AggregateTypeCapabilityGenerator } from "./capability-generator-interface";
import { CapabilityConstructorInput } from "./constructor-input";

export class CreateInstanceCapability extends AggregateTypeCapabilityGenerator {

    public static readonly label: string = "create-instance";
    public static readonly identifier: string = `https://dataspecer.com/application_graph/capability/${this.label}`;

    getCapabilityLabel = (): string => CreateInstanceCapability.label;

    constructor(constructorInput: CapabilityConstructorInput) {
        super(constructorInput.dataStructureMetadata);

        const dalLayerGeneratorStrategy = CreateInstanceTemplateGeneratorFactory.getDalGeneratorStrategy(constructorInput.dataStructureMetadata.specificationIri, constructorInput.datasource);
        const appLayerGeneratorStrategy = TemplateApplicationLayerGeneratorFactory.getApplicationLayerGenerator(
            constructorInput.dataStructureMetadata.technicalLabel,
            CreateInstanceCapability.identifier
        );
        const presentationLayerGeneratorStrategy = PresentationLayerTemplateGeneratorFactory.getPresentationLayerGenerator(
            constructorInput.dataStructureMetadata,
            CreateInstanceCapability.identifier
        );

        this._capabilityStagesGeneratorPipeline = new GeneratorPipeline(
            new DataLayerGeneratorStage(constructorInput.saveBasePath, dalLayerGeneratorStrategy),
            new ApplicationLayerStage(constructorInput.saveBasePath, appLayerGeneratorStrategy),
            new PresentationLayerStage(constructorInput.saveBasePath, CreateInstanceCapability.identifier, presentationLayerGeneratorStrategy)
        );
    }
}