import { ImportRelativePath, TemplateDescription } from "../../../engine/eta-template-renderer"

export interface DeleteCapabilityAppLayerTemplate extends TemplateDescription {
    placeholders: {
        exported_object_name: string;
        delete_mutator_instance: string,
        delete_mutator_instance_path: ImportRelativePath,
        delete_mutator_interface_type: string,
        delete_mutator_interface_type_path: ImportRelativePath,
        generated_capability_class: string,
        read_return_type: string,
        read_return_type_path: ImportRelativePath,

    };
}