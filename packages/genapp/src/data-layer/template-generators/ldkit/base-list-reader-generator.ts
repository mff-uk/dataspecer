import { CapabilityInterfaceGenerator } from "../../../capabilities/template-generators/capability-interface-generator";
import { LayerArtifact } from "../../../engine/layer-artifact";
import { BaseLdkitReaderTemplate } from "../../../template-interfaces/data/base-ldkit-reader-template";
import { TemplateConsumer, TemplateDependencyMap } from "../../../templates/template-consumer";
import { ReaderInterfaceGenerator } from "../reader-interface-generator";

export class BaseListLdkitReaderGenerator extends TemplateConsumer<BaseLdkitReaderTemplate> {

    constructor() {
        super(
            "./list/data-layer/ldkit/base-reader",
            "./readers/ldkit/base-list-reader-implementation.ts"
        );
    }

    processTemplate(dependencies?: TemplateDependencyMap): LayerArtifact {
        const readerInterfaceArtifact = new ReaderInterfaceGenerator().processTemplate();
        const capabilityResultArtifact = new CapabilityInterfaceGenerator().processTemplate();

        const baseLdkitReaderTemplate: BaseLdkitReaderTemplate = {
            templatePath: this._templatePath,
            placeholders: {
                list_reader_interface: readerInterfaceArtifact.exportedObjectName,
                list_reader_interface_path: {
                    from: this._filePath,
                    to: readerInterfaceArtifact.filePath
                },
                list_result_interface: capabilityResultArtifact.exportedObjectName,
                list_result_interface_path: {
                    from: this._filePath,
                    to: capabilityResultArtifact.filePath
                }
            }
        }

        const baseLdkitReaderRender =this._templateRenderer.renderTemplate(baseLdkitReaderTemplate);

        const result: LayerArtifact = {
            exportedObjectName: "LdkitListReader",
            filePath: this._filePath,
            sourceText: baseLdkitReaderRender,
            dependencies: [readerInterfaceArtifact, capabilityResultArtifact]
        }

        return result;
    }
}