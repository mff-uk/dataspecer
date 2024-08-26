
import { TemplateApplicationLayerGeneratorFactory } from "../app-logic-layer/generator-factory";
import { ApplicationLayerStage } from "../app-logic-layer/pipeline-stage";
import { DatasourceConfig, Iri } from "../application-config";
import { DeleteInstanceTemplateGeneratorFactory } from "../data-layer/generator-factory";
import { DataLayerGeneratorStage } from "../data-layer/pipeline-stage";
import { GeneratorPipeline } from "../engine/generator-pipeline";
import { BaseCapabilityGenerator } from "./capability-generator-interface";

export class DeleteInstanceCapability extends BaseCapabilityGenerator {

    public static readonly identifier: string = "https://dataspecer.com/application_graph/capability/delete-instance";

    constructor(aggregateIri: Iri, datasourceConfig: DatasourceConfig) {
        super(aggregateIri);
        
        const dalLayerGeneratorStrategy = DeleteInstanceTemplateGeneratorFactory.getDalGeneratorStrategy(datasourceConfig);
        const appLayerGeneratorStrategy = TemplateApplicationLayerGeneratorFactory.getApplicationLayerGenerator(
            aggregateIri,
            DeleteInstanceCapability.identifier
        );

        //const presentationLayerGeneratorStrategy = PresentationLayerTemplateGeneratorFactory.getPresentationLayerGenerator(targetAggregateName, DeleteInstanceCapability.identifier);

        this._capabilityStagesGeneratorPipeline = new GeneratorPipeline(
            new DataLayerGeneratorStage(datasourceConfig, dalLayerGeneratorStrategy),
            new ApplicationLayerStage(appLayerGeneratorStrategy)
            //new PresentationLayerStage(DeleteInstanceCapability.identifier, presentationLayerGeneratorStrategy)
        );
    }
}
