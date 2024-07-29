import { ImportRelativePath, TemplateDescription } from "../../../../engine/eta-template-renderer"

export interface InstanceDeleteLdkitTemplate extends TemplateDescription {
    placeholders: {
        aggregate_name: string,
        ldkit_schema: string,
        ldkit_schema_path: ImportRelativePath,
        ldkit_endpoint_uri: string,
        instance_result_type: string,
        instance_result_type_path: ImportRelativePath,
        delete_mutator_interface_type: string,
        delete_mutator_interface_type_path: ImportRelativePath
    }
}