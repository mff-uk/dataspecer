
import { TemplateApplicationLayerGeneratorFactory } from "../app-logic-layer/generator-factory";
import { ApplicationLayerStage } from "../app-logic-layer/pipeline-stage";
import { ListTemplateDalGeneratorFactory } from "../data-layer/generator-factory";
import { DataLayerGeneratorStage } from "../data-layer/pipeline-stage";
import { GeneratorPipeline } from "../engine/generator-pipeline";
import { PresentationLayerTemplateGeneratorFactory } from "../presentation-layer/generator-factory";
import { PresentationLayerStage } from "../presentation-layer/pipeline-stage";
import { AggregateTypeCapabilityGenerator } from "./capability-generator-interface";
import { CapabilityConstructorInput } from "./constructor-input";
import { CreateInstanceCapability } from "./create-instance";
import { DeleteInstanceCapability } from "./delete-instance";
import { DetailCapability } from "./detail";

export class ListCapability extends AggregateTypeCapabilityGenerator {

    public static readonly label: string = "list";
    public static readonly identifier: string = `https://dataspecer.com/application_graph/capability/${this.label}`;

    public static readonly allowedTransitions: string[] = [
        CreateInstanceCapability.identifier,
        DeleteInstanceCapability.identifier,
        DetailCapability.identifier
    ];

    getCapabilityLabel = (): string => ListCapability.label;

    constructor(constructorInput: CapabilityConstructorInput) {
        super(constructorInput.dataStructureMetadata);

        const dalLayerGeneratorStrategy = ListTemplateDalGeneratorFactory.getDalGeneratorStrategy(constructorInput.datasource);
        const appLayerGeneratorStrategy = TemplateApplicationLayerGeneratorFactory.getApplicationLayerGenerator(
            constructorInput.dataStructureMetadata.technicalLabel,
            ListCapability.identifier
        );
        const presentationLayerGeneratorStrategy = PresentationLayerTemplateGeneratorFactory.getPresentationLayerGenerator(
            constructorInput.dataStructureMetadata.technicalLabel,
            ListCapability.identifier
        );

        this._capabilityStagesGeneratorPipeline = new GeneratorPipeline(
            new DataLayerGeneratorStage(constructorInput.datasource, dalLayerGeneratorStrategy),
            new ApplicationLayerStage(appLayerGeneratorStrategy),
            new PresentationLayerStage(ListCapability.label, presentationLayerGeneratorStrategy)
        );
    }
}
