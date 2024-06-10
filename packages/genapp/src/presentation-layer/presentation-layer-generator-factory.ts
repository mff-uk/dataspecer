import { PresentationLayerGenerator } from "./presentation-layer-strategy-interface";
import { ListTableTemplateGenerator } from "./template-generators/list/list-table-template-generator";

export type PresentationLayerGeneratorFactory = {
    getPresentationLayerGenerator: (targetCapabilityName: string) => PresentationLayerGenerator;
}

export const PresentationLayerTemplateGeneratorFactory: PresentationLayerGeneratorFactory = {
    getPresentationLayerGenerator(targetCapabilityName: string): PresentationLayerGenerator {

        const capabilityGeneratorMap: { [capabilityName: string] : PresentationLayerGenerator } = {
            list: new ListTableTemplateGenerator({ filePath: "ListTable.tsx", templatePath: "./list/presentation-layer/table-component" })
        }

        const generator = capabilityGeneratorMap[targetCapabilityName];

        if (!generator) {
            throw new Error(`Unable to find template generator for "${targetCapabilityName}"`);
        }

        return generator;
    }
}