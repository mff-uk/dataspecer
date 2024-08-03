import { ImportRelativePath, TemplateDescription } from "../../../../engine/eta-template-renderer"

export interface CreateLdkitInstanceTemplate extends TemplateDescription {
    placeholders: {
        aggregate_name: string,
        ldkit_schema: string,
        ldkit_schema_path: ImportRelativePath,
        ldkit_endpoint_uri: string,
        instance_result_type: string,
        instance_result_type_path: ImportRelativePath,
        creator_interface_type: string,
        creator_interface_type_path: ImportRelativePath
    }
}