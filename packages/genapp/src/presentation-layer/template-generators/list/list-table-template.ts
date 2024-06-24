import { ImportRelativePath, TemplateDescription } from "../../../engine/eta-template-renderer";

export interface ListTableTemplate extends TemplateDescription {
    placeholders: {
        presentation_layer_component_name: string;
        list_capability_app_layer: string;
        list_app_layer_path: ImportRelativePath;
    };
}
