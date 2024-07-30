import { ApplicationLayerGenerator } from "./strategy-interface";
import { DeleteAppLayerTemplateProcessor } from "./template-generators/delete/template-processor";
import { DetailAppLayerTemplateProcessor } from "./template-generators/detail/template-processor";
import { ListAppLayerTemplateProcessor } from "./template-generators/list/template-processor";

export type ApplicationLayerGeneratorFactory = {
    getApplicationLayerGenerator: (aggregateName: string, capabilityIdentifier: string) => ApplicationLayerGenerator;
}

export const TemplateApplicationLayerGeneratorFactory: ApplicationLayerGeneratorFactory = {

    getApplicationLayerGenerator(aggregateName: string, capabilityIdentifier: string) {
        
        const appLayerGenerators: Record<string, ApplicationLayerGenerator> = {
            list: new ListAppLayerTemplateProcessor({
                templatePath: "./list/application-layer/list-app-logic",
                filePath: `./${aggregateName.toLowerCase()}-list-app-logic.ts`
            }),
            detail: new DetailAppLayerTemplateProcessor({
                templatePath: "./detail/application-layer/detail-app-logic",
                filePath: `./${aggregateName.toLowerCase()}-detail-app-logic.ts`
            }),
            "delete-instance": new DeleteAppLayerTemplateProcessor({
                templatePath: "./delete/application-layer/delete-instance-app-logic",
                filePath: `./${aggregateName.toLowerCase()}-delete-instance-app-logic.ts`
            })
        };

        const appLayerGeneratorChoice = appLayerGenerators[capabilityIdentifier];

        if (!appLayerGeneratorChoice) {
            throw new Error(`No matching application layer generator has been found for "${capabilityIdentifier}"!`);
        }

        return appLayerGeneratorChoice;
    }
}