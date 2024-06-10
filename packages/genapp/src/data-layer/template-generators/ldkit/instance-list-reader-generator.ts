import { LayerArtifact } from "../../../engine/layer-artifact";
import { InstanceListLdkitReaderTemplate } from "../../../template-interfaces/data/instance-list-reader-template";
import { TemplateConsumer, TemplateDependencyMap } from "../../../templates/template-consumer";
import { BaseListLdkitReaderGenerator } from "./base-list-reader-generator";

interface InstanceListLdkitReaderDependencyMap extends TemplateDependencyMap {
    ldkitSchemaArtifact: LayerArtifact,
    sparqlEndpointUri: string
}

function isInstanceListLdkitReaderDependencyList(obj: TemplateDependencyMap): obj is InstanceListLdkitReaderDependencyMap {
    return (obj as InstanceListLdkitReaderDependencyMap) !== undefined;
}

export class InstanceListLdkitReaderGenerator extends TemplateConsumer<InstanceListLdkitReaderTemplate> {

    private readonly _aggregateName: string;

    constructor({ templatePath, filePath, aggregateName } :
        { templatePath: string, filePath: string, aggregateName: string }) {
        super(
            templatePath,
            filePath
        );

        if (!aggregateName || aggregateName === "") {
            throw new Error(`Invalid aggregate name argument: "${aggregateName}"`);
        }

        this._aggregateName = aggregateName;
    }

    processTemplate(dependencies: InstanceListLdkitReaderDependencyMap): LayerArtifact {

        if (!dependencies || !isInstanceListLdkitReaderDependencyList(dependencies)) {
            throw new Error("Invalid dependencies list parameter.");
        }

        const baseLdkitListReaderArtifact = new BaseListLdkitReaderGenerator().processTemplate();

        const instanceListLdkitReaderTemplate: InstanceListLdkitReaderTemplate = { 
            templatePath: this._templatePath,
            placeholders: {
                aggregate_name: this._aggregateName,
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
            exportedObjectName: `${this._aggregateName}LdkitListReader`,
            filePath: this._filePath,
            dependencies: [baseLdkitListReaderArtifact, dependencies.ldkitSchemaArtifact]
        }

        return readerInterfaceArtifact;
    }
    
}