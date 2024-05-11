import { CodeTemplateMetadata, TemplateSourceCodeGenerator } from "../app-logic-layer/template-app-logic-generator";
import { DataSourceType, DatasourceConfig } from "../application-config";
import { DataLayerGeneratorStage } from "../data-layer/dal-pipeline-stage";
import { GeneratorPipeline } from "../engine/generator-pipeline";
import { StageGenerationContext } from "../engine/generator-stage-interface";
import { LayerArtifact } from "../engine/layer-artifact";
import { Capability } from "./capability-definition";

export class OverviewCapability implements Capability {

    identifier: string = "overview";    
    // private dataEndpointUri: string = "";
    // private templateAppLogicGenerator: TemplateSourceCodeGenerator;
    // private frontendElementGenerator: TemplateSourceCodeGenerator;
    private readonly pipeline: GeneratorPipeline;

    constructor(datasourceConfig: DatasourceConfig) {

        this.pipeline = new GeneratorPipeline(
            new DataLayerGeneratorStage(datasourceConfig),
            // new ApplicationLayerStage(),
            // new PresentationLayerStage()
        );

        // this.templateAppLogicGenerator = new TemplateSourceCodeGenerator();
        // this.frontendElementGenerator = new TemplateSourceCodeGenerator();
        // if (datasourceConfig.format !== DataSourceType.Local) {
        //     this.dataEndpointUri = datasourceConfig.endpointUri;
        // }
    }

    entryPoint!: LayerArtifact;

    async generateCapability(context: StageGenerationContext): Promise<LayerArtifact> {

        const pipelineOutput = await this.pipeline.generateStage(context);

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
