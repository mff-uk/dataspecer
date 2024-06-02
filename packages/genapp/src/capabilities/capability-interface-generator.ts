import { TemplateDescription } from "../app-logic-layer/template-app-logic-generator";
import { LayerArtifact } from "../engine/layer-artifact";
import { TemplateConsumer } from "../templates/template-consumer";

export interface CapabilityInterfaceTemplate extends TemplateDescription {
    templatePath: string
}

export class CapabilityInterfaceGenerator extends TemplateConsumer {

    constructor(templatePath?: string, filePath?: string) {
        super(
            templatePath ?? "./capability-result-interface",
            filePath ?? "../interfaces/capability-result.ts"
        );
    }

    consumeTemplate(): LayerArtifact {

        const capabilityInterfaceTemplate: CapabilityInterfaceTemplate = {
            templatePath: this._templatePath
        };

        const render = this._templateRenderer.renderTemplate(capabilityInterfaceTemplate);
        const result: LayerArtifact = {
            exportedObjectName: "ListResult",
            filePath: this._filePath,
            sourceText: render
        }

        return result;
    }
}