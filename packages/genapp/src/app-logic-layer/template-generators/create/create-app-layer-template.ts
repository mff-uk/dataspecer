import { ImportRelativePath, TemplateDescription } from "../../../engine/eta-template-renderer"

export interface CreateInstanceCapabilityAppLayerTemplate extends TemplateDescription {
    placeholders: {
        aggregate_name: string,
        instance_creator_type: string,
        instance_creator_type_path: ImportRelativePath,
        creator_interface_type: string,
        creator_interface_type_path: ImportRelativePath,
        generated_capability_class: string,
        read_return_type: string,
        read_return_type_path: ImportRelativePath,
    };
}