import { ImportRelativePath, TemplateDescription } from "../../app-logic-layer/template-app-logic-generator"

export interface ListCapabilityTemplate extends TemplateDescription {
    templatePath: string,
    placeholders: {
        list_reader_interface: string,
        list_reader_interface_path: ImportRelativePath,
        reader_implementation_path: ImportRelativePath,
        generated_capability_class: string,
        read_return_type: string,
        read_return_type_path: ImportRelativePath
    }
}