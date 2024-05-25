import { LayerArtifact } from "../engine/layer-artifact";
import { TemplateConsumer } from "../templates/template-consumer";
import { TemplateDescription } from "../app-logic-layer/template-app-logic-generator";

export interface ReaderInterfaceTemplate extends TemplateConsumer {
    templatePath: string
}

export class ReaderInterfaceGenerator extends TemplateConsumer {

    constructor(templatePath?: string, filePath?: string) {
        super(
            templatePath ?? "./overview/reader-interface",
            filePath ?? "./readers/reader.ts"
        );
    }

    consumeTemplate(): LayerArtifact {
        
        const readerInterfaceTemplate: TemplateDescription = { templatePath: this._templatePath };

        const readerInterfaceRender: string = this._templateRenderer.renderTemplate(readerInterfaceTemplate);

        const readerInterfaceArtifact: LayerArtifact = {
            sourceText: readerInterfaceRender,
            exportedObjectName: "Reader",
            fileName: this._filePath
        }


        return readerInterfaceArtifact;
    }
}