import { LanguageString } from "@dataspecer/core/core/core-resource";
import { LayerArtifact } from "../layer-artifact";
import { AggregateMetadata } from "../../application-config";
import { TemplateGenerator } from "../eta-template-renderer";
import { TemplateModel } from "./template-interfaces";

export type TemplateDependencyMap = Record<"aggregate", AggregateMetadata> & Record<string, any>;

export type TemplateMetadata = {
    templatePath: string,
    filePath: string
};


export abstract class TemplateConsumer<TemplateType extends TemplateModel> {
    protected readonly _templateRenderer: TemplateGenerator<TemplateType>;
    protected readonly _filePath: string;
    protected readonly _templatePath: string;

    constructor(templateMetadata: TemplateMetadata) {
        this._templateRenderer = new TemplateGenerator();
        this._filePath = templateMetadata?.filePath;
        this._templatePath = templateMetadata?.templatePath;
    }

    abstract processTemplate(dependencies: TemplateDependencyMap): Promise<LayerArtifact>;

    protected getTemplatePageTitle(pageTitleLanguageString: LanguageString | undefined, languageId: string = "en"): string | null {
        if (!pageTitleLanguageString || Object.keys(pageTitleLanguageString).length === 0) {
            return null;
        }

        return pageTitleLanguageString[languageId] ?? Object.values(pageTitleLanguageString).at(0)!;
    }
}