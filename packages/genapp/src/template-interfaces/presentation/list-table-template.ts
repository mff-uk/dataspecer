import { ImportRelativePath, TemplateDescription } from "../../app-logic-layer/template-app-logic-generator";

export interface ListTableTemplate extends TemplateDescription {
    templatePath: string;
    placeholders: {
        list_capability_app_layer: string;
        list_app_layer_path: ImportRelativePath;
    };
}
