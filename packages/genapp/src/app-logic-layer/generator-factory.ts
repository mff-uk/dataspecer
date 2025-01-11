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

/**
 * A definition of the factory for creating instances of ApplicationLayerGenerator type. The factories of this type implement
 * the method responsible for the instantiation of the specific application layer generators.
 */
export type ApplicationLayerGeneratorFactory = {
    /**
     * Retrieves the appropriate application layer generator from the provided capability identifier.
     *
     * @param technicalAggregateName - The technical name of the aggregate for which the application layer generator is needed.
     * @param capabilityIri - The IRI identifier of the capability. The identifier determines which application layer generator should be used.
     * @returns The corresponding application layer generator instance.
     */
    getApplicationLayerGenerator: (technicalAggregateName: string, capabilityIri: string) => ApplicationLayerGenerator;
}

/**
 * Factory object used for instantiation of application layer generator for the requested
 * capability identified by its IRI identifier.
 */
export const TemplateApplicationLayerGeneratorFactory: ApplicationLayerGeneratorFactory = {

    /**
     * @inheritdoc
     * @throws Throws an error in case no matching application layer generator is found for the requested capability.
     */
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