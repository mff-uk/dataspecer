import { ImportRelativePath, TemplateDescription } from "../../../../engine/eta-template-renderer";

export interface InstanceListLdkitReaderTemplate extends TemplateDescription {
    placeholders: {
        ldkit_list_reader_base_class: string,
        ldkit_list_reader_base_class_path: ImportRelativePath,
        ldkit_schema: string,
        ldkit_schema_path: ImportRelativePath,
        aggregate_name: string,
        ldkit_endpoint_uri: string
    };
}