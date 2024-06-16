import { ApplicationLayerGenerator } from "./strategy-interface";
import { DetailAppLayerTemplateProcessor } from "./template-generators/detail/template-processor";
import { ListAppLayerTemplateProcessor } from "./template-generators/list/template-processor";

export type ApplicationLayerGeneratorFactory = {
    getApplicationLayerGenerator: (capabilityIdentifier: string) => ApplicationLayerGenerator;
}

export const TemplateApplicationLayerGeneratorFactory: ApplicationLayerGeneratorFactory = {

    getApplicationLayerGenerator(capabilityIdentifier: string) {

        const appLayerGenerators: Record<string, ApplicationLayerGenerator> = {
            list: new ListAppLayerTemplateProcessor({
                templatePath: "./list/application-layer/list-app-logic",
                filePath: "./list-app-logic.ts"
            }),
            detail: new DetailAppLayerTemplateProcessor({
                templatePath: "./detail/application-layer/detail-app-logic",
                filePath: "./detail-app-logic.ts"
            })
        };

        const appLayerGeneratorChoice = appLayerGenerators[capabilityIdentifier];

        if (!appLayerGeneratorChoice) {
            throw new Error(`No matching application layer generator has been found for "${capabilityIdentifier}"!`);
        }

        return appLayerGeneratorChoice;
    }
}