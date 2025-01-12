import { LayerArtifact } from "../../engine/layer-artifact";
import { TemplateModel } from "../../engine/templates/template-interfaces";
import { TemplateConsumer, TemplateDependencyMap } from "../../engine/templates/template-consumer";

interface PaginationComponentTemplate extends TemplateModel {
    /** @inheritdoc */
    placeholders: {
        pagination_component_name: string;
    };
}

/**
 * The `PaginationComponentGenerator` class is responsible for rendering the React component used
 * to display and enable the pagination. It extends the template generator class and makes use of
 * `PaginationComponentTemplate` for template population and rendering.
 *
 * @extends TemplateConsumer<PaginationComponentTemplate>
 */
export class PaginationComponentGenerator extends TemplateConsumer<PaginationComponentTemplate> {

    private static readonly _paginationTemplatePath: string = "./list/presentation-layer/pagination";

    constructor(outputFilePath: string) {
        super({
            filePath: outputFilePath,
            templatePath: PaginationComponentGenerator._paginationTemplatePath
        });
    }

    /**
     * This method is responsible for the population and rendering of the React component template used within the list capability
     * to display a pagination component.
     * After all dependencies needed by template (@see {PaginationComponentTemplate} for more details) are populated,
     * the template renderer is invoked to generate the resulting React component.
     *
     * @param dependencies - Dependencies providing the information about the aggregate and context for the template.
     * @returns A promise that resolves to the artifact which contains generated React component for pagination.
     */
    async processTemplate(dependencies: TemplateDependencyMap): Promise<LayerArtifact> {

        const exportedObjectName: string = dependencies.aggregate.getAggregateNamePascalCase({
            suffix: "Pagination"
        });

        const paginationTemplate: PaginationComponentTemplate = {
            templatePath: this._templatePath,
            placeholders: {
                pagination_component_name: exportedObjectName
            }
        }

        const paginationRender = this._templateRenderer.renderTemplate(paginationTemplate);

        const listItemOptionsArtifact: LayerArtifact = {
            exportedObjectName: exportedObjectName,
            filePath: this._filePath,
            sourceText: paginationRender,
            dependencies: []
        }

        return listItemOptionsArtifact;
    }
}