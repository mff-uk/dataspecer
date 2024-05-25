import DalApi from "../dal-generator-api";
import { LayerArtifact } from "../../engine/layer-artifact";
import { DalGeneratorStrategy, isAxiosResponse } from "../dal-generator-strategy-interface";
import { StageGenerationContext } from "../../engine/generator-stage-interface";
import { ImportRelativePath, TemplateDescription, TemplateGenerator } from "../../app-logic-layer/template-app-logic-generator";
import { ReaderInterfaceGenerator } from "../reader-interface-generator";
import { DataSourceType, DatasourceConfig, UriDatasource } from "../../application-config";

interface LdkitReaderTemplate extends TemplateDescription {
    templatePath: string;
    placeholders: {
        reader: string,
        reader_interface_path: ImportRelativePath,
        schema_name: string,
        schema_filepath: ImportRelativePath,
        sparql_endpointUri: string
    };
}

export class LDKitDalGenerator implements DalGeneratorStrategy {
    
    strategyIdentifier: string = "ldkit";
    private readonly endpoint = "http://localhost:5678";
    private readonly api: DalApi;
    private readonly _datasourceConfig: UriDatasource;
    private readonly _templateRenderer: TemplateGenerator;
    private readonly _filePath: string;
    private readonly _templatePath: string;

    constructor(datasourceConfig: DatasourceConfig, templatePath?: string, filePath?: string) {

        if (datasourceConfig.format !== DataSourceType.Rdf) {
            throw new Error("LDkit data layer generator requires an RDF endpoint.");
        }
        
        this._datasourceConfig = datasourceConfig;
        this.api = new DalApi(this.endpoint);
        this._templateRenderer = new TemplateGenerator();
        this._filePath = filePath ?? "./readers/reader-implementation.ts";
        this._templatePath = templatePath ?? "./overview/ldkit-reader";
    }

    async generateDataLayer(context: StageGenerationContext): Promise<LayerArtifact> {

        const ldkitSchemaArtifact = await this.getLdkitSchema(context.aggregateName);
        const ldkitReader = this.buildRdfReader(ldkitSchemaArtifact);

        return ldkitReader;
    }

    private async getLdkitSchema(aggregateName: string): Promise<LayerArtifact> {
        // TODO: get from passed context
        console.log(`       Calling the backend (${this.endpoint}) for DAL with: `, aggregateName);

        const response = await this.api.generateDalLayerArtifact(this.strategyIdentifier, aggregateName);

        if (!isAxiosResponse(response)) {
            console.log("is LayerArtifact from DataLayerGeneratorStage: ");
            console.log(response);

            throw new Error("Invalid artifact");
        }

        return response.data as LayerArtifact;
    }

    private buildRdfReader(ldkitSchemaArtifact: LayerArtifact): LayerArtifact {
        
        const readerInterfaceArtifact = new ReaderInterfaceGenerator().consumeTemplate();
        const ldkitReaderTemplate: LdkitReaderTemplate = this.populateLdkitReaderTemplate(
            ldkitSchemaArtifact,
            readerInterfaceArtifact
        );
        const ldkitReaderRender: string = this._templateRenderer.renderTemplate(ldkitReaderTemplate);

        const ldkitReaderLayerArtifact = {
            exportedObjectName: "LdkitReader",
            fileName: this._filePath,
            sourceText: ldkitReaderRender,
            dependencies: [readerInterfaceArtifact, ldkitSchemaArtifact]
        } as LayerArtifact;

        return ldkitReaderLayerArtifact;
    }

    private populateLdkitReaderTemplate(ldkitSchemaArtifact: LayerArtifact, readerInterfaceArtifact: LayerArtifact): LdkitReaderTemplate {

        const readerTemplate: LdkitReaderTemplate = {
            templatePath: this._templatePath,
            placeholders: {
                reader: readerInterfaceArtifact.exportedObjectName,
                reader_interface_path: {
                    from: this._filePath,
                    to: readerInterfaceArtifact.fileName
                },
                schema_filepath: {
                    from: this._filePath,
                    to: ldkitSchemaArtifact.fileName
                },
                schema_name: ldkitSchemaArtifact.exportedObjectName,
                sparql_endpointUri: this._datasourceConfig.endpointUri
            }
        };

        return readerTemplate;
    }
}
