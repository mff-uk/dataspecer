import * as fs from "fs";
import { Eta } from "eta";
import path from "path";
import { CodeGenerationArtifactMetadata, getRelativePath, wrapString } from "../utils/utils";

export type CodeTemplateMetadata = {
    targetSourceFilePath: string;
    templatePath: string;
    placeHolders?: { [dependentPlaceholder: string]: CodeTemplateMetadata | string };
    exportedObjectName: string;
}

export class TemplateSourceCodeGenerator {

    private readonly eta: Eta;
    private readonly cache: { [templateName: string]: CodeGenerationArtifactMetadata } = {};
    constructor() {
        this.eta = new Eta({ views: path.join(__dirname, "..", "templates"), autoTrim: false, cache: true });
    }

    writeSourceCodeToFile(sourceCode: string, filepath: string) {
        fs.mkdir(path.dirname(filepath), { recursive: true }, () => {
            fs.writeFileSync(filepath, sourceCode);
        });
    }

    generateFromTemplateMetadata(template: CodeTemplateMetadata): CodeGenerationArtifactMetadata {

        const dependencies = template.placeHolders;
        if (dependencies) {
            Object.entries(dependencies)
                .forEach(([depName, depTemplate]) => {
                    if (typeof depTemplate === "string") {
                        return;
                    }

                    if (depTemplate.templatePath in Object.keys(this.cache)) {
                        const cachedResult = this.cache[depTemplate.templatePath];
                        if (!cachedResult) {
                            throw new Error("Invalid cached result");
                        }

                        dependencies[depName] = wrapString(getRelativePath(template.targetSourceFilePath, cachedResult.objectFilepath));
                        return;
                    }

                    const result = this.generateFromTemplateMetadata(depTemplate);

                    // caching generated result to avoid inconsistency
                    this.cache[depTemplate.templatePath] = result;

                    // replacing template metadata object with the generated content (usually filepath or exported object)
                    dependencies[depName] = wrapString(getRelativePath(template.targetSourceFilePath, result.objectFilepath));
                });
        }

        const renderedSourceCode: string = this.eta
            .render(template.templatePath, template.placeHolders ?? {})
            .replaceAll("&quot;", "\"")
            .replaceAll("&lt;", "<")
            .replaceAll("&gt;", ">");

        this.writeSourceCodeToFile(renderedSourceCode, template.targetSourceFilePath);

        return new CodeGenerationArtifactMetadata({
            [template.exportedObjectName]: template.targetSourceFilePath
        });
    }
}