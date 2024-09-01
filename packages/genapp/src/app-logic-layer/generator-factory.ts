import {
    ListCapability,
    DetailCapability,
    CreateInstanceCapability,
    DeleteInstanceCapability
} from "../capabilities/index";
import { ApplicationLayerGenerator } from "./strategy-interface";
import {
    ListAppLayerGenerator,
    CreateAppLayerGenerator,
    DeleteAppLayerGenerator,
    DetailAppLayerGenerator
} from "./template-generators/index";

export type ApplicationLayerGeneratorFactory = {
    getApplicationLayerGenerator: (technicalAggregateName: string, capabilityIri: string) => ApplicationLayerGenerator;
}

export const TemplateApplicationLayerGeneratorFactory: ApplicationLayerGeneratorFactory = {

    getApplicationLayerGenerator(technicalAggregateName: string, capabilityIri: string) {

        const appLayerGenerators: Record<string, ApplicationLayerGenerator> = {
            [ListCapability.identifier]: new ListAppLayerGenerator({
                templatePath: "./list/application-layer/list-app-logic",
                filePath: `./${technicalAggregateName}-list-app-logic.ts`
            }),
            [DetailCapability.identifier]: new DetailAppLayerGenerator({
                templatePath: "./detail/application-layer/detail-app-logic",
                filePath: `./${technicalAggregateName}-detail-app-logic.ts`
            }),
            [DeleteInstanceCapability.identifier]: new DeleteAppLayerGenerator({
                templatePath: "./delete/application-layer/delete-instance-app-logic",
                filePath: `./${technicalAggregateName}-delete-instance-app-logic.ts`
            }),
            [CreateInstanceCapability.identifier]: new CreateAppLayerGenerator({
                templatePath: "./create/application-layer/create-instance-app-logic",
                filePath: `./${technicalAggregateName}-create-instance-app-logic.ts`
            })
        }

        const appLayerGeneratorChoice = appLayerGenerators[capabilityIri];

        if (!appLayerGeneratorChoice) {
            throw new Error(`No matching application layer generator has been found for "${capabilityIri}"!`);
        }

        return appLayerGeneratorChoice;
    }
}