export interface ImportRelativePath {
    from: string;
    to: string;
}

export interface TemplateDescription {
    templatePath: string;
    placeholders?: { [placeHolderName: string]: string | ImportRelativePath | object | null; };
}

export interface DataLayerTemplateDescription extends TemplateDescription { }
