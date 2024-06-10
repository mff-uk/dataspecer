import { LayerArtifact } from "../../engine/layer-artifact";
import { TemplateConsumer, TemplateDependencyMap } from "../../templates/template-consumer";
import { BaseArtifactSaver } from "../../utils/artifact-saver";
import { ReaderInterfaceTemplate } from "../../template-interfaces/data/reader-interface-template";
import { CapabilityInterfaceGenerator } from "../../capabilities/template-generators/capability-interface-generator";

export class ReaderInterfaceGenerator extends TemplateConsumer<ReaderInterfaceTemplate> {
    
    constructor(templatePath?: string, filePath?: string) {
        super(
            templatePath ?? "./list/data-layer/reader-interface",
            filePath ?? "./readers/list-reader.ts"
        );
    }

    private getThisArtifactFilepath(exportedObjectName: string): string {
        return Object.keys(BaseArtifactSaver.savedArtifactsMap).includes(exportedObjectName)
            ? BaseArtifactSaver.savedArtifactsMap[exportedObjectName]!
            : this._filePath;
    }

    processTemplate(): LayerArtifact {

        const capabilityResultArtifact = new CapabilityInterfaceGenerator().processTemplate();

        const readerInterfaceTemplate: ReaderInterfaceTemplate = { 
            templatePath: this._templatePath,
            placeholders: {
                read_return_type: capabilityResultArtifact.exportedObjectName,
                read_return_type_path: {
                    from: this._filePath,
                    to: capabilityResultArtifact.filePath
                }
            }
        };

        const readerInterfaceRender: string = this._templateRenderer.renderTemplate(readerInterfaceTemplate);

        const readerInterfaceArtifact: LayerArtifact = {
            sourceText: readerInterfaceRender,
            exportedObjectName: "ListReader",
            filePath: this.getThisArtifactFilepath("ListReader"),
            dependencies: [capabilityResultArtifact]
        }

        return readerInterfaceArtifact;
    }
}