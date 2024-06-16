import { PresentationLayerGenerator } from "./strategy-interface";
import { DetailComponentTemplateProcessor } from "./template-generators/detail/detail-template-processor";
import { ListTableTemplateProcessor } from "./template-generators/list/list-table-template-generator";

export type PresentationLayerGeneratorFactory = {
    getPresentationLayerGenerator: (targetCapabilityName: string) => PresentationLayerGenerator;
}

export const PresentationLayerTemplateGeneratorFactory: PresentationLayerGeneratorFactory = {
    getPresentationLayerGenerator(targetCapabilityName: string): PresentationLayerGenerator {

        const capabilityGeneratorMap: { [capabilityName: string] : PresentationLayerGenerator } = {
            list: new ListTableTemplateProcessor({ 
                filePath: "ListTable.tsx", 
                templatePath: "./list/presentation-layer/table-component" 
            }),
            detail: new DetailComponentTemplateProcessor({
                filePath: "InstanceDetail.tsx",
                templatePath: "./detail/presentation-layer/instance-detail-component"
            })
        }

        const generator = capabilityGeneratorMap[targetCapabilityName];

        if (!generator) {
            throw new Error(`Unable to find template generator for "${targetCapabilityName}"`);
        }

        return generator;
    }
}