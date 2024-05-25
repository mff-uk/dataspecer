import { ListCapabilityApplicationLayerStage } from "../app-logic-layer/app-pipeline-stage";
import { CodeTemplateMetadata, TemplateSourceCodeGenerator } from "../app-logic-layer/template-app-logic-generator";
import { CapabilityConfiguration, DatasourceConfig } from "../application-config";
import { DataLayerGeneratorStage } from "../data-layer/dal-pipeline-stage";
import { GeneratorPipeline } from "../engine/generator-pipeline";
import { StageGenerationContext } from "../engine/generator-stage-interface";
import { LayerArtifact } from "../engine/layer-artifact";
import { ListTableTemplate, PresentationLayerStage } from "../presentation-layer/list-pipeline-stage";
import { Capability, CapabilityGenerator } from "./capability-definition";

export class DetailCapability implements Capability {
    identifier: string = "detail";
    entryPoint?: LayerArtifact | undefined;
    generateCapabilityOld(context: StageGenerationContext): Promise<LayerArtifact> {
        throw new Error("Method not implemented.");
    }

}

export class OverviewCapability implements Capability, CapabilityGenerator {

    identifier: string = "overview";
    private readonly _pipeline: GeneratorPipeline;
    private readonly _aggregateName: string;

    constructor(targetAggregateName: string, datasourceConfig: DatasourceConfig) {
        this._aggregateName = targetAggregateName;
        this._pipeline = new GeneratorPipeline(
            new DataLayerGeneratorStage(datasourceConfig),
            new ListCapabilityApplicationLayerStage(),
            new PresentationLayerStage()
        );
    }

    entryPoint!: LayerArtifact;

    private convertConfigToCapabilityContext(config: CapabilityConfiguration): StageGenerationContext {
        const result: StageGenerationContext = {
            aggregateName: this._aggregateName,
            config: config
        };

        return result;
    }

    generateCapability(config: CapabilityConfiguration): Promise<LayerArtifact> {

        const stageContext = this.convertConfigToCapabilityContext(config);

        const pipelineOutput = this._pipeline.generateStages(stageContext);

        console.log(pipelineOutput);

        return pipelineOutput;
    }

    async generateCapabilityOld(context: StageGenerationContext): Promise<LayerArtifact> {

        const pipelineOutput = await this._pipeline.generateStages(context);

        console.log(pipelineOutput);

        return pipelineOutput;
        
        // const dalAxiosResponse = await this.dalGenerator.generate(aggregateName);


        // const generatedDal: CodeGenerationArtifactMetadata = JSON.parse(dalAxiosResponse.data) as CodeGenerationArtifactMetadata;


        // if (!generatedDal) {
        //     throw new Error("Could not generate data layer");
        // }

        // const readerInterface = this.templateAppLogicGenerator.generateFromTemplateMetadata({
        //     templatePath: "./overview/reader-interface",
        //     targetSourceFilePath: "./generated/src/readers/reader.ts",
        //     exportedObjectName: "Reader"
        // });

        // const appLogicResult = this.templateAppLogicGenerator
        //     .generateFromTemplateMetadata({
        //         templatePath: "./overview/overview-app-logic",
        //         targetSourceFilePath: "./generated/src/app-logic/overview-app-logic.ts",
        //         exportedObjectName: "fetchObjects",
        //         placeHolders: {
        //             // TODO: Write a generic selector
        //             reader_interface_path: wrapString(getRelativePath("./generated/src/app-logic/overview-app-logic.ts", readerInterface.objectFilepath)),
        //             reader: readerInterface.objectName,
        //             reader_implementation_path: {
        //                 templatePath: "./overview/ldkit-reader",
        //                 targetSourceFilePath: "./generated/src/readers/reader-implementation.ts",
        //                 exportedObjectName: "LdkitReader", // ReaderImplementation
        //                 placeHolders: {
        //                     reader_path: wrapString(getRelativePath("./generated/src/readers/reader-implementation.ts", readerInterface.objectFilepath)),
        //                     reader: readerInterface.objectName,
        //                     schema_name: generatedDal.objectName,
        //                     schema_filepath: wrapString(getRelativePath("./generated/src/readers/reader-implementation.ts", generatedDal.objectFilepath)),
        //                     sparql_endpointUri: [this.dataEndpointUri]
        //                         .map(endpoint => wrapString(endpoint))
        //                         .join(",")
        //                 }
        //             }
        //         }
        //     });

        // const entrypoint = this.frontendElementGenerator
        //     .generateFromTemplateMetadata({
        //         templatePath: "./overview/overview-table.eta",
        //         targetSourceFilePath: `./generated/src/components/overview/${aggregateName}OverviewTable.tsx`,
        //         exportedObjectName: aggregateName + "OverviewTable",
        //         placeHolders: {
        //             app_logic_delegate: appLogicResult.objectName,
        //             delegate_path: wrapString(getRelativePath(`./generated/src/components/overview/${aggregateName}OverviewTable.tsx`, appLogicResult.objectFilepath))
        //         }
        //     });

        // this.entrypoint = entrypoint;
        // return entrypoint;
    }
}
