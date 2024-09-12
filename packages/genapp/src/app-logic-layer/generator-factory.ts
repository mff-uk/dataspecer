import { CreateInstanceCapabilityMetadata } from "../capabilities/create-instance";
import { DeleteInstanceCapabilityMetadata } from "../capabilities/delete-instance";
import { DetailCapabilityMetadata } from "../capabilities/detail";
import { ListCapabilityMetadata } from "../capabilities/list";
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

        const listMetadata = new ListCapabilityMetadata();
        const detailMetadata = new DetailCapabilityMetadata();
        const createMetadata = new CreateInstanceCapabilityMetadata();
        const deleteMetadata = new DeleteInstanceCapabilityMetadata();

        const appLayerGenerators: Record<string, ApplicationLayerGenerator> = {
            [listMetadata.getIdentifier()]: new ListAppLayerGenerator({
                templatePath: "./list/application-layer/list-app-logic",
                filePath: `./${technicalAggregateName}-list-app-logic.ts`
            }),
            [detailMetadata.getIdentifier()]: new DetailAppLayerGenerator({
                templatePath: "./detail/application-layer/detail-app-logic",
                filePath: `./${technicalAggregateName}-detail-app-logic.ts`
            }),
            [deleteMetadata.getIdentifier()]: new DeleteAppLayerGenerator({
                templatePath: "./delete/application-layer/delete-instance-app-logic",
                filePath: `./${technicalAggregateName}-delete-instance-app-logic.ts`
            }),
            [createMetadata.getIdentifier()]: new CreateAppLayerGenerator({
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