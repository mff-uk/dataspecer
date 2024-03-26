import * as fs from "fs";
import { Eta } from "eta";
import path from "path";

export type CodeTemplateMetadata = {
    targetSourceFilePath: string;
    templatePath: string;
    placeHolders?: { [dependentPlaceholder: string]: CodeTemplateMetadata | string };
}

type ImportFilepathMetadata = {
    importFilePath: string
}

type FullImportMetadata = { importObjectName: string } & ImportFilepathMetadata;

type CodeGenerationResult = ImportFilepathMetadata | FullImportMetadata;

export class TemplateAppLogicGenerator {

    private readonly eta: Eta;
    private readonly cache: { [templateName: string]: CodeGenerationResult } = {};
    constructor() {
        this.eta = new Eta({ views: path.join(__dirname, "..", "templates") });
    }

    getRelativePath(sourcePath: string, targetPath: string): string {
        // removes file extension
        targetPath = targetPath.substring(0, targetPath.lastIndexOf(".") < 1 ? targetPath.length : targetPath.lastIndexOf("."));

        const prefix = path.dirname(sourcePath) === path.dirname(targetPath) ? "./" : "";

        return prefix + path.posix.relative(path.dirname(sourcePath), targetPath);
    }

    writeSourceCodeToFile(sourceCode: string, filepath: string) {
        fs.mkdir(path.dirname(filepath), { recursive: true }, () => {
            fs.writeFileSync(filepath, sourceCode);
        });
    }

    generateFromTemplateMetadata(template: CodeTemplateMetadata): CodeGenerationResult {

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
                    
                    dependencies[depName] = this.getRelativePath(template.targetSourceFilePath, cachedResult.importFilePath);;
                    return;
                }

                const result = this.generateFromTemplateMetadata(depTemplate);

                // caching generated result to avoid inconsistency
                this.cache[depTemplate.templatePath] = result;

                // replacing template metadata object with the generated content (usually filepath or exported object)
                dependencies[depName] = this.getRelativePath(template.targetSourceFilePath, result.importFilePath);
            });
        }
        
        const renderedSourceCode: string = this.eta.render(template.templatePath, template.placeHolders ?? {});

        this.writeSourceCodeToFile(renderedSourceCode, template.targetSourceFilePath);

        return { importFilePath: template.targetSourceFilePath };
    }
}