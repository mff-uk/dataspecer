export interface ImportRelativePath {
    from: string;
    to: string;
}

/**
 * Model for capturing metadata for a template used for rendering source code.
 * Provides an interface to define, what a specific template expects and needs in order to
 * generate code. Additionally, `TemplateModel` instance determines the location of the template to be used.
 */
export interface TemplateModel {
    /**
     * The path to the template to be rendered.
     */
    templatePath: string;

    /**
     * An object containing placeholders for template values.
     * These properties must provide a corresponding value before
     * being processed by the template renderer.
     */
    placeholders?: { [placeHolderName: string]: string | ImportRelativePath | object | null; };
}

export interface DataLayerTemplateDescription extends TemplateModel { }
