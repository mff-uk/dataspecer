import { UseNavigationHookGenerator } from "../../capabilities/template-generators/capability-interface-generator";
import { ImportRelativePath, TemplateModel } from "../../engine/templates/template-interfaces";
import { LayerArtifact } from "../../engine/layer-artifact";
import { TemplateConsumer, TemplateDependencyMap } from "../../engine/templates/template-consumer";
import { AllowedTransition } from "../../engine/transitions/transitions-generator";

/**
 * Represents a template definition for rendering the React component which contains the configuration of
 * a list item options.
 *
 * @interface ListItemCapabilityOptionsTemplate
 */
interface ListItemCapabilityOptionsTemplate extends TemplateModel {
    /** @inheritdoc */
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

/**
 * The `ListItemCapabilityOptionsGenerator` class is responsible for rendering the React component from a template
 * and thus generating the presentation layer code to display the list of available actions for a list item.
 * It extends the template generator class and makes use of `ListItemCapabilityOptionsTemplate`
 * for template population and rendering.
 *
 * @extends TemplateConsumer<ListItemCapabilityOptionsTemplate>
 */
export class ListItemCapabilityOptionsGenerator extends TemplateConsumer<ListItemCapabilityOptionsTemplate> {

    private static readonly _optionsListTemplatePath: string = "./list/presentation-layer/item-capability-options";

    constructor(outputFilePath: string) {
        super({
            filePath: outputFilePath,
            templatePath: ListItemCapabilityOptionsGenerator._optionsListTemplatePath
        });
    }

    /**
     * This method is responsible for the population and rendering of the React component template used within the list capability
     * to display the list of available actions on a list item.
     * After all dependencies needed by template (@see {ListItemCapabilityOptionsTemplate} for more details) are populated,
     * the template renderer is invoked to generate the resulting React component.
     *
     * @param dependencies - Dependencies providing the information about the aggregate and context for the template.
     * @returns A promise that resolves to the artifact which contains generated React component.
     */
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