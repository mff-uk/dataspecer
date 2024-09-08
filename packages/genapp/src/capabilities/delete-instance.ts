
import { TemplateApplicationLayerGeneratorFactory } from "../app-logic-layer/generator-factory";
import { ApplicationLayerStage } from "../app-logic-layer/pipeline-stage";
import { DeleteInstanceTemplateGeneratorFactory } from "../data-layer/generator-factory";
import { DataLayerGeneratorStage } from "../data-layer/pipeline-stage";
import { GeneratorPipeline } from "../engine/generator-pipeline";
import { InstanceTypeCapabilityGenerator } from "./capability-generator-interface";
import { CapabilityConstructorInput } from "./constructor-input";

export class DeleteInstanceCapability extends InstanceTypeCapabilityGenerator {

    public static readonly label: string = "delete-instance";
    public static readonly identifier: string = `https://dataspecer.com/application_graph/capability/${this.label}`;

    getCapabilityLabel = (): string => DeleteInstanceCapability.label;

    constructor(constructorInput: CapabilityConstructorInput) {
        super(constructorInput.dataStructureMetadata);

        const dalLayerGeneratorStrategy = DeleteInstanceTemplateGeneratorFactory.getDalGeneratorStrategy(constructorInput.dataStructureMetadata.specificationIri, constructorInput.datasource);
        const appLayerGeneratorStrategy = TemplateApplicationLayerGeneratorFactory.getApplicationLayerGenerator(
            constructorInput.dataStructureMetadata.technicalLabel,
            DeleteInstanceCapability.identifier
        );

        //const presentationLayerGeneratorStrategy = PresentationLayerTemplateGeneratorFactory.getPresentationLayerGenerator(targetAggregateName, DeleteInstanceCapability.identifier);

        this._capabilityStagesGeneratorPipeline = new GeneratorPipeline(
            new DataLayerGeneratorStage(constructorInput.datasource, dalLayerGeneratorStrategy),
            new ApplicationLayerStage(appLayerGeneratorStrategy)
            //new PresentationLayerStage(DeleteInstanceCapability.identifier, presentationLayerGeneratorStrategy)
        );
    }
}
