import { ImportRelativePath, TemplateDescription } from "../../engine/eta-template-renderer";

// TODO: Change / use more generic interfaceTemplate and placeholder names (e.g. InterfaceTemplate and return_type)
export interface ReaderInterfaceTemplate extends TemplateDescription {
    templatePath: string;
    placeholders: {
        read_return_type: string;
        read_return_type_path: ImportRelativePath;
    };
}
