import { TemplateDescription } from "../../engine/eta-template-renderer";
import { LayerArtifact } from "../../engine/layer-artifact";
import { TemplateConsumer, TemplateMetadata } from "../../engine/template-consumer";

export interface CapabilityInterfaceTemplate extends TemplateDescription {
    templatePath: string
}

class CapabilityInterfaceGenerator extends TemplateConsumer<CapabilityInterfaceTemplate> {

    private readonly _capabilityInterfaceExportedName: string;
    constructor(templateMetadata: TemplateMetadata & { queryExportedObjectName: string }) {
        super({
            templatePath: templateMetadata.templatePath,
            filePath: templateMetadata.filePath
        });

        this._capabilityInterfaceExportedName = templateMetadata.queryExportedObjectName;
    }

    async processTemplate(): Promise<LayerArtifact> {

        const capabilityInterfaceTemplate: CapabilityInterfaceTemplate = {
            templatePath: this._templatePath
        };

        const render = this._templateRenderer.renderTemplate(capabilityInterfaceTemplate);
        const result: LayerArtifact = {
            exportedObjectName: this._capabilityInterfaceExportedName,
            filePath: this._filePath,
            sourceText: render
        }

        return result;
    }
}

export type CapabilityInterfaceGeneratorType = CapabilityInterfaceGenerator;

export const CopyTemplateProcessor = CapabilityInterfaceGenerator;

export const ListResultReturnInterfaceGenerator = new CapabilityInterfaceGenerator({
    filePath: "../interfaces/capability-result.ts",
    templatePath: "./capability-result-interface",
    queryExportedObjectName: "ListResult"
});

export const InstanceResultReturnInterfaceGenerator = new CapabilityInterfaceGenerator({
    filePath: "../interfaces/capability-result.ts",
    templatePath: "./capability-result-interface",
    queryExportedObjectName: "InstanceResult"
});

export const GeneratedCapabilityInterfaceGenerator = new CapabilityInterfaceGenerator({
    filePath: "../interfaces/capability-result.ts",
    templatePath: "./capability-result-interface",
    queryExportedObjectName: "GeneratedCapability"
});
