import { UseNavigationHookGenerator } from "../../capabilities/template-generators/capability-interface-generator";
import { ImportRelativePath, TemplateDescription } from "../../engine/templates/template-interfaces";
import { LayerArtifact } from "../../engine/layer-artifact";
import { TemplateConsumer, TemplateDependencyMap } from "../../engine/templates/template-consumer";
import { AllowedTransition } from "../../engine/transitions/transitions-generator";

interface ListItemCapabilityOptionsTemplate extends TemplateDescription {
    placeholders: {
        export_name: string;
        aggregate_technical_label: string;
        instance_transitions: AllowedTransition[];
        navigation_hook: string;
        navigation_hook_path: ImportRelativePath;
    };
}

export interface ListItemCapabilityOptionsDependencyMap extends TemplateDependencyMap {
    transitions: AllowedTransition[];
}

export class ListItemCapabilityOptionsGenerator extends TemplateConsumer<ListItemCapabilityOptionsTemplate> {

    async processTemplate(dependencies: ListItemCapabilityOptionsDependencyMap): Promise<LayerArtifact> {

        const exportedObjectName: string = dependencies.aggregate.getAggregateNamePascalCase({
            suffix: "ListItemOptions"
        });

        const useNavigationHook = await UseNavigationHookGenerator.processTemplate();

        const optionsTemplate: ListItemCapabilityOptionsTemplate = {
            templatePath: this._templatePath,
            placeholders: {
                aggregate_technical_label: dependencies.aggregate.technicalLabel,
                export_name: exportedObjectName,
                navigation_hook: useNavigationHook.exportedObjectName,
                navigation_hook_path: {
                    from: this._filePath,
                    to: useNavigationHook.filePath
                },
                instance_transitions: dependencies.transitions,
            }
        }

        const listItemOptionsRender = this._templateRenderer.renderTemplate(optionsTemplate);

        const listItemOptionsArtifact: LayerArtifact = {
            exportedObjectName: exportedObjectName,
            filePath: this._filePath,
            sourceText: listItemOptionsRender,
            dependencies: [useNavigationHook]
        }

        return listItemOptionsArtifact;
    }
}