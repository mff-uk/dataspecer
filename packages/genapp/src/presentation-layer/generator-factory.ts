import {
    ListCapability,
    DetailCapability,
    CreateInstanceCapability,
    DeleteInstanceCapability
} from "../capabilities/index";
import { toPascalCase } from "../utils/utils";
import { PresentationLayerGenerator } from "./strategy-interface";
import { CreateInstanceComponentTemplateProcessor } from "./template-generators/create/create-component-processor";
import { DetailComponentTemplateProcessor } from "./template-generators/detail/detail-template-processor";
import { ListTableTemplateProcessor } from "./template-generators/list/list-table-template-processor";

export type PresentationLayerGeneratorFactory = {
    getPresentationLayerGenerator: (aggregateName: string, capabilityIdentifier: string) => PresentationLayerGenerator;
}

export const PresentationLayerTemplateGeneratorFactory: PresentationLayerGeneratorFactory = {
    getPresentationLayerGenerator(aggregateName: string, capabilityIri: string): PresentationLayerGenerator {

        const pascalCaseAggregateName = toPascalCase(aggregateName);

        const capabilityGeneratorMap: { [capabilityIri: string] : PresentationLayerGenerator } = {
            [ListCapability.identifier]: new ListTableTemplateProcessor({
                filePath: `${pascalCaseAggregateName}ListTable.tsx`,
                templatePath: "./list/presentation-layer/table-component"
            }),
            [DetailCapability.identifier]: new DetailComponentTemplateProcessor({
                filePath: `${pascalCaseAggregateName}InstanceDetail.tsx`,
                templatePath: "./detail/presentation-layer/instance-detail-component"
            }),
            [CreateInstanceCapability.identifier]: new CreateInstanceComponentTemplateProcessor({
                filePath: `Create${pascalCaseAggregateName}Instance.tsx`,
                templatePath: "./create/presentation-layer/create-instance-component"
            }),
            [DeleteInstanceCapability.identifier]: undefined!,
        }

        const generator = capabilityGeneratorMap[capabilityIri];

        if (!generator) {
            throw new Error(`Unable to find template generator for "${capabilityIri}"`);
        }

        return generator;
    }
}