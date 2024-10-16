export interface ImportRelativePath {
    from: string;
    to: string;
}

/**
 * Model for capturing metadata for a template used for rendering source code.
 * Provides an interface to define, what a specific template expects and needs in order to
 * generate code.
 */
export interface TemplateModel {
    templatePath: string;
    placeholders?: { [placeHolderName: string]: string | ImportRelativePath | object | null; };
}

export interface DataLayerTemplateDescription extends TemplateModel { }
