import { ImportRelativePath, TemplateDescription } from "../../../engine/eta-template-renderer"

export interface DetailCapabilityAppLayerTemplate extends TemplateDescription {
    placeholders: {
        detail_app_layer_exported_name: string,
        instance_reader_interface: string,
        generated_capability_class: string,
        read_return_type: string,
        read_return_type_path: ImportRelativePath,
        reader_implementation_path: ImportRelativePath,
        instance_reader_interface_path: ImportRelativePath,
    };
}