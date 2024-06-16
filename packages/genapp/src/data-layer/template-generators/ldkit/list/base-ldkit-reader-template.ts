import { TemplateDescription, ImportRelativePath } from "../../../../engine/eta-template-renderer";

export interface BaseLdkitReaderTemplate extends TemplateDescription {
    templatePath: string;
    placeholders: {
        list_reader_interface: string;
        list_result_interface: string;
        list_reader_interface_path: ImportRelativePath;
        list_result_interface_path: ImportRelativePath;
    };
}
