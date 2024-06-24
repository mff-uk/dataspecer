import { ImportRelativePath, TemplateDescription } from "../../../engine/eta-template-renderer";

export interface DetailReactComponentTemplate extends TemplateDescription {
    placeholders: {
        aggregate_name: string,
        detail_capability_app_layer: string,
        detail_app_layer_path: ImportRelativePath
    };
}
