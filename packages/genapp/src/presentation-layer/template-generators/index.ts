import { CreateInstanceComponentTemplateProcessor } from "./create-component-processor";
import { DeleteInstanceComponentTemplateProcessor } from "./delete-instance-template-generator";
import { EditInstanceComponentTemplateProcessor } from "./edit-instance-processor";
import { DetailComponentTemplateProcessor } from "./detail-template-processor";
import { ListTableTemplateProcessor } from "./list-table-template-processor";

export {
    CreateInstanceComponentTemplateProcessor as CreateComponentGenerator,
    DeleteInstanceComponentTemplateProcessor as DeleteComponentGenerator,
    EditInstanceComponentTemplateProcessor as EditComponentGenerator,
    DetailComponentTemplateProcessor as DetailComponentGenerator,
    ListTableTemplateProcessor as ListComponentGenerator
}