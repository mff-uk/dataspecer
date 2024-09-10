import { TemplateDescription } from "../../../engine/eta-template-renderer";
import { LayerArtifact } from "../../../engine/layer-artifact";
import { AllowedTransition } from "../../../engine/transitions/transitions-generator";
import { TemplateConsumer, TemplateDependencyMap } from "../../../engine/template-consumer";

interface ListItemCapabilityOptionsTemplate extends TemplateDescription {
    placeholders: {
        export_name: string;
        capability_transitions: AllowedTransition[];
    };
}

export interface ListItemCapabilityOptionsDependencyMap extends TemplateDependencyMap {
    transitions: AllowedTransition[];
}

export class ListItemCapabilityOptionsGenerator extends TemplateConsumer<ListItemCapabilityOptionsTemplate> {

    async processTemplate(dependencies: ListItemCapabilityOptionsDependencyMap): Promise<LayerArtifact> {

        const exportedObjectName: string = dependencies.aggregate.getAggregateNamePascalCase({
            suffix: "ListItemCapabilityOptions"
        });

        const optionsTemplate: ListItemCapabilityOptionsTemplate = {
            templatePath: this._templatePath,
            placeholders: {
                export_name: exportedObjectName,
                capability_transitions: dependencies.transitions,
            }
        }

        const listItemOptionsRender = this._templateRenderer.renderTemplate(optionsTemplate);

        const listItemOptionsArtifact: LayerArtifact = {
            exportedObjectName: exportedObjectName,
            filePath: this._filePath,
            sourceText: listItemOptionsRender,
        }

        return listItemOptionsArtifact;
    }
}