import { AggregateMetadata } from "../application-config";
import {
    CREATE_CAPABILITY_ID,
    DELETE_CAPABILITY_ID,
    DETAIL_CAPABILITY_ID,
    EDIT_CAPABILITY_ID,
    LIST_CAPABILITY_ID
} from "../capabilities";
import { PresentationLayerGenerator } from "./strategy-interface";
import { CreateInstanceComponentTemplateProcessor } from "./template-generators/create/create-component-processor";
import { DeleteInstanceComponentTemplateProcessor } from "./template-generators/delete/delete-instance-template-generator";
import { EditInstanceComponentTemplateProcessor } from "./template-generators/edit/edit-instance-processor";
import { DetailComponentTemplateProcessor } from "./template-generators/detail/detail-template-processor";
import { ListTableTemplateProcessor } from "./template-generators/list/list-table-template-processor";

export type PresentationLayerGeneratorFactory = {
    getPresentationLayerGenerator: (aggregateMetadata: AggregateMetadata, capabilityIdentifier: string) => PresentationLayerGenerator;
}

export const PresentationLayerTemplateGeneratorFactory: PresentationLayerGeneratorFactory = {
    getPresentationLayerGenerator(aggregateMetadata: AggregateMetadata, capabilityIri: string): PresentationLayerGenerator {

        const pascalCaseAggregateName = aggregateMetadata.getAggregateNamePascalCase();

        const capabilityGeneratorMap: { [capabilityIri: string] : PresentationLayerGenerator } = {
            [LIST_CAPABILITY_ID]: new ListTableTemplateProcessor({
                filePath: `${pascalCaseAggregateName}ListTable.tsx`,
                templatePath: "./list/presentation-layer/table-component"
            }),
            [DETAIL_CAPABILITY_ID]: new DetailComponentTemplateProcessor({
                filePath: `${pascalCaseAggregateName}InstanceDetail.tsx`,
                templatePath: "./detail/presentation-layer/instance-detail-component"
            }),
            [CREATE_CAPABILITY_ID]: new CreateInstanceComponentTemplateProcessor({
                filePath: `Create${pascalCaseAggregateName}Instance.tsx`,
                templatePath: "./create/presentation-layer/create-instance-component"
            }),
            [DELETE_CAPABILITY_ID]: new DeleteInstanceComponentTemplateProcessor({
                filePath: `Delete${pascalCaseAggregateName}Instance.tsx`,
                templatePath: "./delete/presentation-layer/delete-instance-confirmation-modal"
            }),
            [EDIT_CAPABILITY_ID]: new EditInstanceComponentTemplateProcessor({
                templatePath: "./edit/presentation-layer/edit-instance-component",
                filePath: `Edit${pascalCaseAggregateName}Instance.tsx`
            })
        }

        const generator = capabilityGeneratorMap[capabilityIri];

        if (!generator) {
            throw new Error(`Unable to find template generator for "${capabilityIri}"`);
        }

        return generator;
    }
}