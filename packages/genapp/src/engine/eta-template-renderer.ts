import path from "path";
import { Eta } from "eta";
import { getRelativePath } from "../utils/utils";
import { BaseArtifactSaver } from "../utils/artifact-saver";

export interface ImportRelativePath {
    from: string;
    to: string;
}

export interface TemplateDescription {
    templatePath: string;
    placeholders?: { [placeHolderName: string]: string | ImportRelativePath | object };
}

function isImportRelativePath(obj: any): obj is ImportRelativePath {
    const relPath = (obj as ImportRelativePath);
    return relPath !== undefined
        && relPath.from !== undefined
        && relPath.to !== undefined;
}

export class TemplateGenerator<TTemplate extends TemplateDescription> {

    private readonly _eta: Eta;
    constructor() {
        this._eta = new Eta({
            views: path.join(__dirname, "..", "..", "templates"),
            autoTrim: false,
            cache: true
        });
    }

    renderTemplate(template: TTemplate): string {

        if (!template) {
            throw new Error("Invalid template description");
        }

        if (template.placeholders) {
            Object.entries(template.placeholders)
                .forEach(([placeholderName, placeholderValue]) => {
                    if (!isImportRelativePath(placeholderValue)) {
                        return;
                    }

                    const relativePath = getRelativePath(placeholderValue.from, placeholderValue.to);
                    template.placeholders![placeholderName] = `"${relativePath}"`;
                });
        }

        const renderedSourceCode: string = this._eta.render(
            template.templatePath,
            template.placeholders ?? {}
        );

        return renderedSourceCode;
    }
}
