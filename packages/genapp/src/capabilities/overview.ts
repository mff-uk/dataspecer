import { CodeTemplateMetadata, TemplateAppLogicGenerator } from "../app-logic/template-app-logic-generator";
import { DataSourceType, DatasourceConfig } from "../application-config";
import { DalGenerator, DalGeneratorFactory } from "../data-layer/dal-generator-factory";
import { Capability } from "./capability-definition";

export class OverviewCapability implements Capability {
    identifier: string = "overview";
    private dalGenerator: DalGenerator;
    private dataEndpointUri: string = "";
    private templateAppLogicGenerator: TemplateAppLogicGenerator;
    private frontendElementGenerator: TemplateAppLogicGenerator;

    constructor(datasourceConfig: DatasourceConfig) {
        this.dalGenerator = DalGeneratorFactory.getDalGenerator(datasourceConfig);
        this.templateAppLogicGenerator = new TemplateAppLogicGenerator();
        this.frontendElementGenerator = new TemplateAppLogicGenerator();
        if (datasourceConfig.format !== DataSourceType.Local) {
            this.dataEndpointUri = datasourceConfig.endpointUri;
        }
    }

    generateCapability(aggregateName: string): void {
        this.dalGenerator.generate();

        const readerInterface: CodeTemplateMetadata = {
            templatePath: "./overview/reader-interface",
            targetSourceFilePath: "./generated/readers/reader.ts"
        }

        // TODO: If 2+ outputs are expected (exported object / filename ...), tell within the CodeTemplate.<target value>

        this.templateAppLogicGenerator
            .generateFromTemplateMetadata({
                templatePath: "./overview/overview-app-logic",
                targetSourceFilePath: "./generated/app-logic/overview-app-logic.ts",
                placeHolders: {
                    // TODO: Write a generic selector
                    reader_interface_path: readerInterface,
                    reader_implementation_path: {
                        templatePath: "./overview/ldkit-reader",
                        targetSourceFilePath: "./generated/readers/reader-implementation.ts",
                        placeHolders: {
                            reader_path: readerInterface,
                            schema_name: aggregateName, // TODO: get generated schema name from data layer
                            schema_filepath: "<schema_filepath_placeholder.ts>", // TODO: get generated code filepath from data layer
                            sparql_endpointUri: this.dataEndpointUri
                        }
                    }
                }
            });

        this.frontendElementGenerator.generateFromTemplateMetadata({
            templatePath: "./overview/overview-table.eta",
            targetSourceFilePath: "./generated/components/overview/OverviewTable.tsx"
        });
    }
}
