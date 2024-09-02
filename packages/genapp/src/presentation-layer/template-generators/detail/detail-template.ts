import { ImportRelativePath, TemplateDescription } from "../../../engine/eta-template-renderer";
import { AllowedTransition } from "../../../engine/transitions/transitions-generator";

export interface DetailReactComponentTemplate extends TemplateDescription {
    placeholders: {
        aggregate_name: string;
        export_name: string;
        detail_capability_app_layer: string;
        detail_app_layer_path: ImportRelativePath;
        useJsonSchema_hook: string;
        useJsonSchema_hook_path: ImportRelativePath;
        capability_transitions: AllowedTransition[];
    };
}
