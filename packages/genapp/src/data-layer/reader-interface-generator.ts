import { LayerArtifact } from "../engine/layer-artifact";
import { TemplateConsumer } from "../templates/template-consumer";
import { ImportRelativePath, TemplateDescription } from "../app-logic-layer/template-app-logic-generator";
import { CapabilityInterfaceGenerator } from "../capabilities/capability-interface-generator";
import { BaseArtifactSaver } from "../utils/artifact-saver";

export interface ReaderInterfaceTemplate extends TemplateDescription {
    templatePath: string,
    placeholders: {
        read_return_type: string,
        read_return_type_path: ImportRelativePath
    }
}

export class ReaderInterfaceGenerator extends TemplateConsumer {

    constructor(templatePath?: string, filePath?: string) {
        super(
            templatePath ?? "./overview/reader-interface",
            filePath ?? "./readers/list-reader.ts"
        );
    }

    private getThisArtifactFilepath(exportedObjectName: string): string {
        return Object.keys(BaseArtifactSaver.savedArtifactsMap).includes(exportedObjectName)
            ? BaseArtifactSaver.savedArtifactsMap[exportedObjectName]!
            : this._filePath;
    }

    consumeTemplate(): LayerArtifact {

        const capabilityResultArtifact = new CapabilityInterfaceGenerator().consumeTemplate();

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