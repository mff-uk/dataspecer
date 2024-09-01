import { CreateInstanceAppLayerTemplateProcessor } from "./create/template-processor";
import { DeleteAppLayerTemplateProcessor } from "./delete/template-processor";
import { DetailAppLayerTemplateProcessor } from "./detail/template-processor";
import { ListAppLayerTemplateProcessor } from "./list/template-processor";


export {
    CreateInstanceAppLayerTemplateProcessor as CreateAppLayerGenerator,
    DeleteAppLayerTemplateProcessor as DeleteAppLayerGenerator, 
    DetailAppLayerTemplateProcessor as DetailAppLayerGenerator,
    ListAppLayerTemplateProcessor as ListAppLayerGenerator
}