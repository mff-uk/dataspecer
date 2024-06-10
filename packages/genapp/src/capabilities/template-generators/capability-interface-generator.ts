import { TemplateDescription } from "../../engine/eta-template-renderer";
import { LayerArtifact } from "../../engine/layer-artifact";
import { TemplateConsumer, TemplateDependencyMap } from "../../templates/template-consumer";

export interface CapabilityInterfaceTemplate extends TemplateDescription {
    templatePath: string
}

export class CapabilityInterfaceGenerator extends TemplateConsumer<CapabilityInterfaceTemplate> {

    constructor(templatePath?: string, filePath?: string) {
        super(
            templatePath ?? "./capability-result-interface",
            filePath ?? "../interfaces/capability-result.ts"
        );
    }

    processTemplate(): LayerArtifact {

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