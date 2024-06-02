import JSZip from "jszip";
import DalApi from "../dal-generator-api";
import { LayerArtifact } from "../../engine/layer-artifact";
import { DalGeneratorStrategy, isAxiosResponse } from "../dal-generator-strategy-interface";
import { StageGenerationContext } from "../../engine/generator-stage-interface";
import { ImportRelativePath, TemplateDescription, TemplateGenerator } from "../../app-logic-layer/template-app-logic-generator";
import { ReaderInterfaceGenerator } from "../reader-interface-generator";
import { LDkitSchemaSelectorGenerator } from "../ldkit-schema-selector-generator";

interface LdkitReaderTemplate extends TemplateDescription {
    templatePath: string;
    placeholders: {
        list_reader_interface: string,
        list_reader_interface_path: ImportRelativePath,
        ldkitSchema_selector: string,
        schema_selector_path: ImportRelativePath
    };
}

export class LDKitDalGenerator implements DalGeneratorStrategy {
    
    strategyIdentifier: string = "ldkit";
    private readonly endpoint = "http://localhost:8889";
    private readonly api: DalApi;
    private readonly _templateRenderer: TemplateGenerator;
    private readonly _filePath: string;
    private readonly _templatePath: string;

    constructor(templatePath?: string, filePath?: string) {        
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
        //console.log(`       Calling the backend (${this.endpoint}) for DAL with: `, aggregateName);

        const response = await this.api.generateDalLayerArtifact(this.strategyIdentifier, aggregateName);

        if (!isAxiosResponse(response) || response.status !== 200) {
            throw new Error("Invalid artifact returned from server");
        }

        const zip = await JSZip.loadAsync(response.data);

        if (!zip.folder("genapp") || !zip.folder("genapp")?.folder("LDkit")) {
            throw new Error("Missing LDkit artifact");
        }

        const aggregateFiles = zip.filter(path => path.includes(aggregateName.toLowerCase()));

        if (!aggregateFiles || aggregateFiles.length !== 1) {
            throw new Error("No LDkit schema file found for selected aggregate");
        }

        const aggregateSchemaFile = aggregateFiles.at(0)!;
        
        const contentPromise = aggregateSchemaFile.async("string");
        const schemaFilename = aggregateSchemaFile.name.substring(aggregateSchemaFile.name.lastIndexOf("/") + 1);

        const fileContent = await contentPromise;
        const result: LayerArtifact = {
            filePath: schemaFilename,
            sourceText: fileContent,
            exportedObjectName: `${aggregateName}Schema`
        }
        return result;
    }

    private buildRdfReader(ldkitSchemaArtifact: LayerArtifact): LayerArtifact {
        
        const readerInterfaceArtifact = new ReaderInterfaceGenerator().consumeTemplate();
        const schemaSelectorArtifact = new LDkitSchemaSelectorGenerator().consumeTemplate();
        const ldkitReaderTemplate: LdkitReaderTemplate = this.populateLdkitReaderTemplate(
            schemaSelectorArtifact,
            readerInterfaceArtifact
        );
        const ldkitReaderRender: string = this._templateRenderer.renderTemplate(ldkitReaderTemplate);

        const ldkitReaderLayerArtifact = {
            exportedObjectName: "LdkitListReader",
            filePath: this._filePath,
            sourceText: ldkitReaderRender,
            dependencies: [readerInterfaceArtifact, schemaSelectorArtifact, ldkitSchemaArtifact]
        } as LayerArtifact;

        return ldkitReaderLayerArtifact;
    }

    private populateLdkitReaderTemplate(schemaSelectorArtifact: LayerArtifact, readerInterfaceArtifact: LayerArtifact): LdkitReaderTemplate {

        const readerTemplate: LdkitReaderTemplate = {
            templatePath: this._templatePath,
            placeholders: {
                list_reader_interface: readerInterfaceArtifact.exportedObjectName,
                list_reader_interface_path: {
                    from: this._filePath,
                    to: readerInterfaceArtifact.filePath
                },
                ldkitSchema_selector: schemaSelectorArtifact.exportedObjectName,
                schema_selector_path: {
                    from: this._filePath,
                    to: schemaSelectorArtifact.filePath
                }
            }
        };

        return readerTemplate;
    }
}
