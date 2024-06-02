import path from "path";
import { Eta } from "eta";
import { getRelativePath } from "../utils/utils";

export interface ImportRelativePath {
    from: string;
    to: string;
}

export interface TemplateDescription {
    templatePath: string;
    placeholders?: { [placeHolderName: string]: string | ImportRelativePath };
}

export class TemplateGenerator {

    private readonly _eta: Eta;
    constructor() {
        this._eta = new Eta({
            views: path.join(__dirname, "..", "templates"),
            autoTrim: false,
            cache: true
        });
    }

    renderTemplate<TTemplate extends TemplateDescription>(template: TTemplate): string {

        if (!template) {
            throw new Error("Invalid template description");
        }

        if (template.placeholders) {
            Object.entries(template.placeholders)
                .forEach(([placeholderName, placeholderValue]) => {
                    if (typeof placeholderValue === "string") {
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
