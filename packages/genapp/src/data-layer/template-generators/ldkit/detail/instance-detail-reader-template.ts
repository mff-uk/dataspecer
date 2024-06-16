import { ImportRelativePath, TemplateDescription } from "../../../../engine/eta-template-renderer";

export interface InstanceDetailLdkitReaderTemplate extends TemplateDescription {
    placeholders: {
        ldkit_instance_reader: string,
        ldkit_instance_reader_path: ImportRelativePath,
        ldkit_schema: string,
        ldkit_schema_path: ImportRelativePath,
        aggregate_name: string,
        instance_result_type: string,
        ldkit_endpoint_uri: string
    };
}