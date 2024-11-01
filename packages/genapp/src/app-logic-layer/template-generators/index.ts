import { CreateInstanceAppLayerTemplateProcessor } from "./create-instance-generator";
import { DeleteAppLayerTemplateProcessor } from "./delete-instance-generator";
import { DetailAppLayerTemplateProcessor } from "./instance-detail-generator";
import { ListAppLayerTemplateProcessor } from "./instance-list-generator";
import { EditInstanceAppLayerTemplateProcessor } from "./edit-instance-generator";


export {
    CreateInstanceAppLayerTemplateProcessor as CreateAppLayerGenerator,
    DeleteAppLayerTemplateProcessor as DeleteAppLayerGenerator,
    DetailAppLayerTemplateProcessor as DetailAppLayerGenerator,
    ListAppLayerTemplateProcessor as ListAppLayerGenerator,
    EditInstanceAppLayerTemplateProcessor as EditAppLayerGenerator
}