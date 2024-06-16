import { ImportRelativePath, TemplateDescription } from "../../engine/eta-template-renderer";

export interface ReaderInterfaceTemplate extends TemplateDescription {
    templatePath: string;
    placeholders: {
        read_return_type: string;
        read_return_type_path: ImportRelativePath;
    };
}
