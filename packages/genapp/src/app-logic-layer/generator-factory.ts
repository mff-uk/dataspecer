import {
    LIST_CAPABILITY_ID,
    DETAIL_CAPABILITY_ID,
    DELETE_CAPABILITY_ID,
    CREATE_CAPABILITY_ID,
    EDIT_CAPABILITY_ID,

 } from "../capabilities";
import { ApplicationLayerGenerator } from "./strategy-interface";
import {
    ListAppLayerGenerator,
    CreateAppLayerGenerator,
    DeleteAppLayerGenerator,
    DetailAppLayerGenerator,
    EditAppLayerGenerator
} from "./template-generators";

export type ApplicationLayerGeneratorFactory = {
    getApplicationLayerGenerator: (technicalAggregateName: string, capabilityIri: string) => ApplicationLayerGenerator;
}

export const TemplateApplicationLayerGeneratorFactory: ApplicationLayerGeneratorFactory = {

    getApplicationLayerGenerator(technicalAggregateName: string, capabilityIri: string) {

        const appLayerGenerators: Record<string, ApplicationLayerGenerator> = {
            [LIST_CAPABILITY_ID]: new ListAppLayerGenerator(`./${technicalAggregateName}-list-app-logic.ts`),
            [DETAIL_CAPABILITY_ID]: new DetailAppLayerGenerator(`./${technicalAggregateName}-detail-app-logic.ts`),
            [DELETE_CAPABILITY_ID]: new DeleteAppLayerGenerator(`./${technicalAggregateName}-delete-instance-app-logic.ts`),
            [CREATE_CAPABILITY_ID]: new CreateAppLayerGenerator(`./${technicalAggregateName}-create-instance-app-logic.ts`),
            [EDIT_CAPABILITY_ID]: new EditAppLayerGenerator(`./${technicalAggregateName}-edit-instance-app-logic.ts`)
        }

        const appLayerGeneratorChoice = appLayerGenerators[capabilityIri];

        if (!appLayerGeneratorChoice) {
            throw new Error(`No matching application layer generator has been found for "${capabilityIri}"!`);
        }

        return appLayerGeneratorChoice;
    }
}