import { LayerArtifact } from "../../../engine/layer-artifact";
import { TemplateConsumer, TemplateDependencyMap, TemplateMetadata } from "../../../engine/template-consumer";
import { BaseListLdkitReaderGenerator } from "./base-list-reader-generator";
import { ImportRelativePath, TemplateDescription } from "../../../engine/eta-template-renderer";

interface InstanceListLdkitReaderDependencyMap extends TemplateDependencyMap {
    ldkitSchemaArtifact: LayerArtifact,
    sparqlEndpointUri: string
}

interface InstanceListLdkitReaderTemplate extends TemplateDescription {
    placeholders: {
        ldkit_list_reader_base_class: string,
        ldkit_list_reader_base_class_path: ImportRelativePath,
        ldkit_schema: string,
        ldkit_schema_path: ImportRelativePath,
        aggregate_name: string,
        ldkit_endpoint_uri: string
    };
}

function isInstanceListLdkitReaderDependencyList(obj: TemplateDependencyMap): obj is InstanceListLdkitReaderDependencyMap {
    return (obj as InstanceListLdkitReaderDependencyMap) !== undefined;
}

export class InstanceListLdkitReaderGenerator extends TemplateConsumer<InstanceListLdkitReaderTemplate> {

    constructor(templateMetadata: TemplateMetadata) {
        super(templateMetadata);
    }

    async processTemplate(dependencies: InstanceListLdkitReaderDependencyMap): Promise<LayerArtifact> {

        if (!dependencies || !isInstanceListLdkitReaderDependencyList(dependencies)) {
            throw new Error("Invalid dependencies list parameter.");
        }

        const baseLdkitListReaderArtifact = await new BaseListLdkitReaderGenerator().processTemplate();
        const listExportedObject = dependencies.aggregate.getAggregateNamePascalCase({
            suffix: "LdkitListReader"
        });

        const instanceListLdkitReaderTemplate: InstanceListLdkitReaderTemplate = {
            templatePath: this._templatePath,
            placeholders: {
                aggregate_name: listExportedObject,
                ldkit_endpoint_uri: `"${dependencies.sparqlEndpointUri}"`,
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
            dependencies: [baseLdkitListReaderArtifact, dependencies.ldkitSchemaArtifact]
        }

        return readerInterfaceArtifact;
    }
}