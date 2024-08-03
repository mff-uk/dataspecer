import { PresentationLayerGenerator } from "./strategy-interface";
import { CreateInstanceComponentTemplateProcessor } from "./template-generators/create/create-component-generator";
import { DetailComponentTemplateProcessor } from "./template-generators/detail/detail-template-processor";
import { ListTableTemplateProcessor } from "./template-generators/list/list-table-template-processor";

export type PresentationLayerGeneratorFactory = {
    getPresentationLayerGenerator: (targetAggregateName: string, targetCapabilityName: string) => PresentationLayerGenerator;
}

export const PresentationLayerTemplateGeneratorFactory: PresentationLayerGeneratorFactory = {
    getPresentationLayerGenerator(aggregateName: string, targetCapabilityName: string): PresentationLayerGenerator {

        const capabilityGeneratorMap: { [capabilityName: string] : PresentationLayerGenerator } = {
            list: new ListTableTemplateProcessor({ 
                filePath: `${aggregateName}ListTable.tsx`, 
                templatePath: "./list/presentation-layer/table-component" 
            }),
            detail: new DetailComponentTemplateProcessor({
                filePath: `${aggregateName}InstanceDetail.tsx`,
                templatePath: "./detail/presentation-layer/instance-detail-component"
            }),
            "create-instance": new CreateInstanceComponentTemplateProcessor({
                filePath: `Create${aggregateName}Instance.tsx`,
                templatePath: "./create/presentation-layer/create-instance-component"
            }),
            "delete-instance": undefined!,
        }

        const generator = capabilityGeneratorMap[targetCapabilityName];

        if (!generator) {
            throw new Error(`Unable to find template generator for "${targetCapabilityName}"`);
        }

        return generator;
    }
}