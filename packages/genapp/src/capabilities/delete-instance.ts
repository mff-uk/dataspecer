
import { TemplateApplicationLayerGeneratorFactory } from "../app-logic-layer/generator-factory";
import { ApplicationLayerStage } from "../app-logic-layer/pipeline-stage";
import { DatasourceConfig } from "../application-config";
import { DeleteInstanceTemplateGeneratorFactory } from "../data-layer/generator-factory";
import { DataLayerGeneratorStage } from "../data-layer/pipeline-stage";
import { GeneratorPipeline } from "../engine/generator-pipeline";
import { BaseCapabilityGenerator } from "./capability-generator-interface";
import { CapabilityConstructorInput } from "./constructor-input";

export class DeleteInstanceCapability extends BaseCapabilityGenerator {

    public static readonly label: string = "delete-instance";
    public static readonly identifier: string = `https://dataspecer.com/application_graph/capability/${this.label}`;

    constructor(constructorInput: CapabilityConstructorInput) {
        super(constructorInput.rootLabel, constructorInput.rootStructureIri);
        
        const dalLayerGeneratorStrategy = DeleteInstanceTemplateGeneratorFactory.getDalGeneratorStrategy(constructorInput.datasource);
        const appLayerGeneratorStrategy = TemplateApplicationLayerGeneratorFactory.getApplicationLayerGenerator(
            constructorInput.rootLabel,
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
