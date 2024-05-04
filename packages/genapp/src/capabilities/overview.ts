import { CodeTemplateMetadata, TemplateSourceCodeGenerator } from "../app-logic/template-app-logic-generator";
import { DataSourceType, DatasourceConfig } from "../application-config";
import { DalGenerator, DalGeneratorFactory } from "../data-layer/dal-generator-factory";
import { CodeGenerationArtifactMetadata, getRelativePath, wrapString } from "../utils/utils";
import { Capability } from "./capability-definition";

export class OverviewCapability implements Capability {
    identifier: string = "overview";
    entrypoint!: CodeGenerationArtifactMetadata;
    private dalGenerator: DalGenerator;
    private dataEndpointUri: string = "";
    private templateAppLogicGenerator: TemplateSourceCodeGenerator;
    private frontendElementGenerator: TemplateSourceCodeGenerator;

    constructor(datasourceConfig: DatasourceConfig) {
        this.dalGenerator = DalGeneratorFactory.getDalGenerator(datasourceConfig);
        this.templateAppLogicGenerator = new TemplateSourceCodeGenerator();
        this.frontendElementGenerator = new TemplateSourceCodeGenerator();
        if (datasourceConfig.format !== DataSourceType.Local) {
            this.dataEndpointUri = datasourceConfig.endpointUri;
        }
    }

    async generateCapability(aggregateName: string): Promise<CodeGenerationArtifactMetadata> {

        console.log(`   Generate ${aggregateName} BEFORE`);
        const dalAxiosResponse = await this.dalGenerator.generate(aggregateName);

        console.log(`   Generate ${aggregateName} AFTER`);

        const generatedDal: CodeGenerationArtifactMetadata = JSON.parse(dalAxiosResponse.data) as CodeGenerationArtifactMetadata;

        console.log("   Dal: ", generatedDal);

        if (!generatedDal) {
            throw new Error("Could not generate data layer");
        }

        const readerInterface = this.templateAppLogicGenerator.generateFromTemplateMetadata({
            templatePath: "./overview/reader-interface",
            targetSourceFilePath: "./generated/src/readers/reader.ts",
            exportedObjectName: "Reader"
        });

        const appLogicResult = this.templateAppLogicGenerator
            .generateFromTemplateMetadata({
                templatePath: "./overview/overview-app-logic",
                targetSourceFilePath: "./generated/src/app-logic/overview-app-logic.ts",
                exportedObjectName: "fetchObjects",
                placeHolders: {
                    // TODO: Write a generic selector
                    reader_interface_path: wrapString(getRelativePath("./generated/src/app-logic/overview-app-logic.ts", readerInterface.objectFilepath)),
                    reader: readerInterface.objectName,
                    reader_implementation_path: {
                        templatePath: "./overview/ldkit-reader",
                        targetSourceFilePath: "./generated/src/readers/reader-implementation.ts",
                        exportedObjectName: "LdkitReader", // ReaderImplementation
                        placeHolders: {
                            reader_path: wrapString(getRelativePath("./generated/src/readers/reader-implementation.ts", readerInterface.objectFilepath)),
                            reader: readerInterface.objectName,
                            schema_name: generatedDal.objectName, // TODO: get generated schema name from data layer
                            schema_filepath: wrapString(getRelativePath("./generated/src/readers/reader-implementation.ts", generatedDal.objectFilepath)), // TODO: get generated code filepath from data layer
                            sparql_endpointUri: [this.dataEndpointUri]
                                .map(endpoint => wrapString(endpoint))
                                .join(",")
                        }
                    }
                }
            });

        console.log("   Logic: ", appLogicResult);

        const entrypoint = this.frontendElementGenerator
            .generateFromTemplateMetadata({
                templatePath: "./overview/overview-table.eta",
                targetSourceFilePath: `./generated/src/components/overview/${aggregateName}OverviewTable.tsx`,
                exportedObjectName: aggregateName + "OverviewTable",
                placeHolders: {
                    app_logic_delegate: appLogicResult.objectName,
                    delegate_path: wrapString(getRelativePath(`./generated/src/components/overview/${aggregateName}OverviewTable.tsx`, appLogicResult.objectFilepath))
                }
            });

        console.log("   Capab entrypoint: ", entrypoint);
        this.entrypoint = entrypoint;
        return entrypoint;
    }
}