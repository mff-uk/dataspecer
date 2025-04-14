import { LayerArtifact } from "../../../engine/layer-artifact.ts";
import { TemplateConsumer, TemplateDependencyMap } from "../../../engine/templates/template-consumer.ts";
import { BaseListLdkitReaderGenerator } from "./base-list-reader-generator.ts";
import { DataLayerTemplateDescription, ImportRelativePath } from "../../../engine/templates/template-interfaces.ts";
import { LdkitDalDependencyMap } from "../../strategies/ldkit-template-strategy.ts";
import { ReadWriteEndpointUri } from "../../../engine/graph/datasource.ts";

export interface InstanceListLdkitReaderTemplate extends DataLayerTemplateDescription {
    placeholders: {
        ldkit_list_reader_base_class: string,
        ldkit_list_reader_base_class_path: ImportRelativePath,
        ldkit_schema: string,
        ldkit_schema_path: ImportRelativePath,
        aggregate_name: string,
        ldkit_endpoint_uri: string
    };
}

function isInstanceListLdkitReaderDependencyList(obj: TemplateDependencyMap): obj is LdkitDalDependencyMap {
    return (obj as LdkitDalDependencyMap) !== undefined;
}

export class InstanceListLdkitReaderGenerator extends TemplateConsumer<InstanceListLdkitReaderTemplate> {

    private static readonly _ldkitListDataLayerTemplatePath = "./list/data-layer/ldkit/aggregate-specific-reader";

    constructor(outputFilePath: string) {
        super({
            filePath: outputFilePath,
            templatePath: InstanceListLdkitReaderGenerator._ldkitListDataLayerTemplatePath
        });
    }

    async processTemplate(dependencies: LdkitDalDependencyMap): Promise<LayerArtifact> {

        if (!dependencies || !isInstanceListLdkitReaderDependencyList(dependencies)) {
            throw new Error("Invalid dependencies list parameter.");
        }

        const baseLdkitListReaderArtifact = await new BaseListLdkitReaderGenerator().processTemplate();
        const listExportedObject = dependencies.aggregate.getAggregateNamePascalCase({
            suffix: "LdkitListReader"
        });

        const readSparqlEndpointUri = typeof dependencies.sparqlEndpointUri === "string"
            ? dependencies.sparqlEndpointUri
            : (dependencies.sparqlEndpointUri as ReadWriteEndpointUri).read;

        const instanceListLdkitReaderTemplate: InstanceListLdkitReaderTemplate = {
            templatePath: this._templatePath,
            placeholders: {
                aggregate_name: listExportedObject,
                ldkit_endpoint_uri: `"${readSparqlEndpointUri}"`,
                ldkit_schema: dependencies.ldkitSchemaArtifact.exportedObjectName,
                ldkit_list_reader_base_class: baseLdkitListReaderArtifact.exportedObjectName,
                ldkit_list_reader_base_class_path: {
                    from: this._filePath,
                    to: baseLdkitListReaderArtifact.filePath
                },
                ldkit_schema_path: {
                    from: this._filePath,
                    to: dependencies.ldkitSchemaArtifact.filePath
                }
            }
        };

        const ldkitInstanceListReader: string = this._templateRenderer.renderTemplate(instanceListLdkitReaderTemplate);

        const readerInterfaceArtifact: LayerArtifact = {
            sourceText: ldkitInstanceListReader,
            exportedObjectName: listExportedObject,
            filePath: this._filePath,
            dependencies: [baseLdkitListReaderArtifact, dependencies.ldkitSchemaArtifact, dependencies.ldkitSchemaInterfaceArtifact]
        }

        return readerInterfaceArtifact;
    }
}