import { ImportRelativePath, TemplateDescription } from "../../../engine/eta-template-renderer";

export interface CreateInstanceReactComponentTemplate extends TemplateDescription {
    placeholders: {
        aggregate_name: string,
        create_capability_app_layer: string,
        create_capability_app_layer_path: ImportRelativePath
    };
}
