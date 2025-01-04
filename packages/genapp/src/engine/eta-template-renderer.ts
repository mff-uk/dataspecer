import path from "path";
import { Eta } from "eta";
import { getRelativePath } from "../utils/utils";
import { ImportRelativePath, TemplateModel } from "./templates/template-interfaces";

function isImportRelativePath(obj: any): obj is ImportRelativePath {
    if (!obj) {
        return false;
    }

    const relPath = (obj as ImportRelativePath);
    return relPath !== undefined
        && relPath.from !== undefined
        && relPath.to !== undefined;
}

export class TemplateGenerator<TTemplate extends TemplateModel> {

    /** Eta renderer instance used for rendering templates */
    private readonly _eta: Eta;
    constructor() {
        this._eta = new Eta({
            views: path.resolve(__dirname, "..", "..", "templates"),
            autoTrim: false,
            cache: true
        });
    }

    /**
     * Renders a template using the template model provided as parameter.

     * @param {TTemplate} template - The template model containing the template path and placeholders.
     * @returns {string} - The rendered template string.
     */
    renderTemplate(template: TTemplate): string {

        if (!template) {
            throw new Error("Invalid template description");
        }

        if (template.placeholders) {
            for (const [placeholderName, placeholderValue] of Object.entries(template.placeholders)) {
                if (!isImportRelativePath(placeholderValue)) {
                    continue;
                }

                const relativePath = getRelativePath(placeholderValue.from, placeholderValue.to);
                template.placeholders![placeholderName] = `"${relativePath}"`;
            }
        }

        const renderedSourceCode: string = this._eta.render(
            template.templatePath,
            template.placeholders ?? {}
        );

        return renderedSourceCode;
    }
}
