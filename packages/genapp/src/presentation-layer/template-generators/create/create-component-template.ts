import { ImportRelativePath, TemplateDescription } from "../../../engine/eta-template-renderer";
import { AllowedTransition } from "../../../engine/transitions/transitions-generator";

export interface CreateInstanceReactComponentTemplate extends TemplateDescription {
    placeholders: {
        aggregate_name: string,
        create_capability_app_layer: string,
        create_capability_app_layer_path: ImportRelativePath,
        useJsonSchema_hook: string,
        useJsonSchema_hook_path: ImportRelativePath,
        supported_out_create_edges: AllowedTransition[]
    };
}