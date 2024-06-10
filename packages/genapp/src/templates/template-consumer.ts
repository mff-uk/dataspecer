import { TemplateDescription, TemplateGenerator } from "../engine/eta-template-renderer";
import { LayerArtifact } from "../engine/layer-artifact";

export interface TemplateDependencyMap {
    [dependencyKey: string]: any
}

export abstract class TemplateConsumer<TemplateType extends TemplateDescription> {
    protected readonly _templateRenderer: TemplateGenerator<TemplateType>;
    protected readonly _filePath: string;
    protected readonly _templatePath: string;

    constructor(templatePath: string, filePath: string) {
        this._templateRenderer = new TemplateGenerator();
        this._filePath = filePath;
        this._templatePath = templatePath;
    }

    abstract processTemplate(dependencies: TemplateDependencyMap): LayerArtifact;
}