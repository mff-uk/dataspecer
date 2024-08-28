import { CreateInstanceCapability } from "../capabilities/create-instance";
import { DeleteInstanceCapability } from "../capabilities/delete-instance";
import { DetailCapability } from "../capabilities/detail";
import { ListCapability } from "../capabilities/list";
import { PresentationLayerGenerator } from "./strategy-interface";
import { CreateInstanceComponentTemplateProcessor } from "./template-generators/create/create-component-generator";
import { DetailComponentTemplateProcessor } from "./template-generators/detail/detail-template-processor";
import { ListTableTemplateProcessor } from "./template-generators/list/list-table-template-processor";

export type PresentationLayerGeneratorFactory = {
    getPresentationLayerGenerator: (aggregateName: string, capabilityIdentifier: string) => PresentationLayerGenerator;
}

export const PresentationLayerTemplateGeneratorFactory: PresentationLayerGeneratorFactory = {
    getPresentationLayerGenerator(aggregateName: string, capabilityIri: string): PresentationLayerGenerator {

        const capabilityGeneratorMap: { [capabilityIri: string] : PresentationLayerGenerator } = {
            [ListCapability.identifier]: new ListTableTemplateProcessor({ 
                filePath: `${aggregateName}ListTable.tsx`, 
                templatePath: "./list/presentation-layer/table-component" 
            }),
            [DetailCapability.identifier]: new DetailComponentTemplateProcessor({
                filePath: `${aggregateName}InstanceDetail.tsx`,
                templatePath: "./detail/presentation-layer/instance-detail-component"
            }),
            [CreateInstanceCapability.identifier]: new CreateInstanceComponentTemplateProcessor({
                filePath: `Create${aggregateName}Instance.tsx`,
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