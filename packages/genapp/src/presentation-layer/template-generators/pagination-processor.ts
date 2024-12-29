import { LayerArtifact } from "../../engine/layer-artifact";
import { TemplateModel } from "../../engine/templates/template-interfaces";
import { TemplateConsumer, TemplateDependencyMap } from "../../engine/templates/template-consumer";

interface PaginationComponentTemplate extends TemplateModel {
    placeholders: {
        pagination_component_name: string;
    };
}

export class PaginationComponentGenerator extends TemplateConsumer<PaginationComponentTemplate> {

    private static readonly _paginationTemplatePath: string = "./list/presentation-layer/pagination";

    constructor(outputFilePath: string) {
        super({
            filePath: outputFilePath,
            templatePath: PaginationComponentGenerator._paginationTemplatePath
        });
    }

    async processTemplate(dependencies: TemplateDependencyMap): Promise<LayerArtifact> {

        console.log("Before pagination");
        const exportedObjectName: string = dependencies.aggregate.getAggregateNamePascalCase({
            suffix: "Pagination"
        });

        console.log("Filling pagination template");
        const paginationTemplate: PaginationComponentTemplate = {
            templatePath: this._templatePath,
            placeholders: {
                pagination_component_name: exportedObjectName
            }
        }

        console.log("Rendering pagination template ...");
        const paginationRender = this._templateRenderer.renderTemplate(paginationTemplate);
        console.log("Rendered pagination template!");

        const listItemOptionsArtifact: LayerArtifact = {
            exportedObjectName: exportedObjectName,
            filePath: this._filePath,
            sourceText: paginationRender,
            dependencies: []
        }

        console.log("After pagination");
        return listItemOptionsArtifact;
    }
}