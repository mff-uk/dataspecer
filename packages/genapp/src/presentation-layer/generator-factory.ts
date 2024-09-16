import { AggregateMetadata } from "../application-config";
import { CreateInstanceCapabilityMetadata } from "../capabilities/create-instance";
import { DeleteInstanceCapabilityMetadata } from "../capabilities/delete-instance";
import { DetailCapabilityMetadata } from "../capabilities/detail";
import { ListCapabilityMetadata } from "../capabilities/list";
import { PresentationLayerGenerator } from "./strategy-interface";
import { CreateInstanceComponentTemplateProcessor } from "./template-generators/create/create-component-processor";
import { DeleteInstanceComponentTemplateProcessor } from "./template-generators/delete/delete-instance-template-generator";
import { DetailComponentTemplateProcessor } from "./template-generators/detail/detail-template-processor";
import { ListTableTemplateProcessor } from "./template-generators/list/list-table-template-processor";

export type PresentationLayerGeneratorFactory = {
    getPresentationLayerGenerator: (aggregateMetadata: AggregateMetadata, capabilityIdentifier: string) => PresentationLayerGenerator;
}

export const PresentationLayerTemplateGeneratorFactory: PresentationLayerGeneratorFactory = {
    getPresentationLayerGenerator(aggregateMetadata: AggregateMetadata, capabilityIri: string): PresentationLayerGenerator {

        const pascalCaseAggregateName = aggregateMetadata.getAggregateNamePascalCase();
        const listMetadata = new ListCapabilityMetadata();
        const detailMetadata = new DetailCapabilityMetadata();
        const createMetadata = new CreateInstanceCapabilityMetadata();
        const deleteMetadata = new DeleteInstanceCapabilityMetadata();

        const capabilityGeneratorMap: { [capabilityIri: string] : PresentationLayerGenerator } = {
            [listMetadata.getIdentifier()]: new ListTableTemplateProcessor({
                filePath: `${pascalCaseAggregateName}ListTable.tsx`,
                templatePath: "./list/presentation-layer/table-component"
            }),
            [detailMetadata.getIdentifier()]: new DetailComponentTemplateProcessor({
                filePath: `${pascalCaseAggregateName}InstanceDetail.tsx`,
                templatePath: "./detail/presentation-layer/instance-detail-component"
            }),
            [createMetadata.getIdentifier()]: new CreateInstanceComponentTemplateProcessor({
                filePath: `Create${pascalCaseAggregateName}Instance.tsx`,
                templatePath: "./create/presentation-layer/create-instance-component"
            }),
            [deleteMetadata.getIdentifier()]: new DeleteInstanceComponentTemplateProcessor({
                filePath: `Delete${pascalCaseAggregateName}Instance.tsx`,
                templatePath: "./delete/presentation-layer/delete-instance-confirmation-modal"
            }),
        }

        const generator = capabilityGeneratorMap[capabilityIri];

        if (!generator) {
            throw new Error(`Unable to find template generator for "${capabilityIri}"`);
        }

        return generator;
    }
}