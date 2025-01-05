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

/**
 * Abstract class which provides a way to consume templates. This is used mostly by different generators responsible for populating
 * the source code templates with appropriate values.
 *
 * @template TemplateType - Specific template model. @see {TemplateModel} for more details.
 */
export abstract class TemplateConsumer<TemplateType extends TemplateModel> {
    protected readonly _templateRenderer: TemplateGenerator<TemplateType>;
    protected readonly _filePath: string;
    protected readonly _templatePath: string;

    constructor(templateMetadata: TemplateMetadata) {
        this._templateRenderer = new TemplateGenerator();
        this._filePath = templateMetadata?.filePath;
        this._templatePath = templateMetadata?.templatePath;
    }

    /**
     * Method to be implemented by specific template consumers; within this method the specific
     * generator will populate the template and invoke the template renderer to generate an artifact.
     */
    abstract processTemplate(dependencies: TemplateDependencyMap): Promise<LayerArtifact>;

    /**
     * Retrieves the title of a template page in the specified language.
     *
     * @param pageTitleLanguageString - An object containing language-specific titles.
     * @param languageId - The language identifier for the title. Defaults to "en", if not provided.
     * @returns The page title in the specified language, or the first available language if not found.
     */
    protected getTemplatePageTitle(pageTitleLanguageString: LanguageString | undefined, languageId: string = "en"): string | null {
        if (!pageTitleLanguageString || Object.keys(pageTitleLanguageString).length === 0) {
            return null;
        }

        return pageTitleLanguageString[languageId] ?? Object.values(pageTitleLanguageString).at(0)!;
    }
}