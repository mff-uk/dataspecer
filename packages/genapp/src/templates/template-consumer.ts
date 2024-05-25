import { TemplateDescription, TemplateGenerator } from "../app-logic-layer/template-app-logic-generator";
import { LayerArtifact } from "../engine/layer-artifact";

export abstract class TemplateConsumer {
    protected readonly _templateRenderer: TemplateGenerator;
    protected readonly _filePath: string;
    protected readonly _templatePath: string;

    constructor(templatePath: string, filePath: string) {
        this._templateRenderer = new TemplateGenerator();
        this._filePath = filePath;
        this._templatePath = templatePath;
    }

    abstract consumeTemplate(): LayerArtifact;
}