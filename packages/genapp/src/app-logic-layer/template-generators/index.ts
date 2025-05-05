import { CreateInstanceAppLayerTemplateProcessor } from "./create-instance-generator.ts";
import { DeleteAppLayerTemplateProcessor } from "./delete-instance-generator.ts";
import { DetailAppLayerTemplateProcessor } from "./instance-detail-generator.ts";
import { ListAppLayerTemplateProcessor } from "./instance-list-generator.ts";
import { EditInstanceAppLayerTemplateProcessor } from "./edit-instance-generator.ts";


export {
    CreateInstanceAppLayerTemplateProcessor as CreateAppLayerGenerator,
    DeleteAppLayerTemplateProcessor as DeleteAppLayerGenerator,
    DetailAppLayerTemplateProcessor as DetailAppLayerGenerator,
    ListAppLayerTemplateProcessor as ListAppLayerGenerator,
    EditInstanceAppLayerTemplateProcessor as EditAppLayerGenerator
}