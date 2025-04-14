import { CreateInstanceComponentTemplateProcessor } from "./create-component-processor.ts";
import { DeleteInstanceComponentTemplateProcessor } from "./delete-instance-template-generator.ts";
import { EditInstanceComponentTemplateProcessor } from "./edit-instance-processor.ts";
import { DetailComponentTemplateProcessor } from "./detail-template-processor.ts";
import { ListTableTemplateProcessor } from "./list-table-template-processor.ts";

export {
    CreateInstanceComponentTemplateProcessor as CreateComponentGenerator,
    DeleteInstanceComponentTemplateProcessor as DeleteComponentGenerator,
    EditInstanceComponentTemplateProcessor as EditComponentGenerator,
    DetailComponentTemplateProcessor as DetailComponentGenerator,
    ListTableTemplateProcessor as ListComponentGenerator
}