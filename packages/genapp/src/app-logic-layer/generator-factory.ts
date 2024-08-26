import { Iri } from "../application-config";
import { CreateInstanceCapability } from "../capabilities/create-instance";
import { DeleteInstanceCapability } from "../capabilities/delete-instance";
import { DetailCapability } from "../capabilities/detail";
import { ListCapability } from "../capabilities/list";
import { ApplicationLayerGenerator } from "./strategy-interface";
import { CreateInstanceAppLayerTemplateProcessor } from "./template-generators/create/template-processor";
import { DeleteAppLayerTemplateProcessor } from "./template-generators/delete/template-processor";
import { DetailAppLayerTemplateProcessor } from "./template-generators/detail/template-processor";
import { ListAppLayerTemplateProcessor } from "./template-generators/list/template-processor";

export type ApplicationLayerGeneratorFactory = {
    getApplicationLayerGenerator: (aggregateName: string, capabilityIdentifier: Iri) => ApplicationLayerGenerator;
}

export const TemplateApplicationLayerGeneratorFactory: ApplicationLayerGeneratorFactory = {

    getApplicationLayerGenerator(aggregateName: Iri, capabilityIdentifier: Iri) {

        const appLayerGenerators: Record<Iri, ApplicationLayerGenerator> = {
            [ListCapability.identifier]: new ListAppLayerTemplateProcessor({
                templatePath: "./list/application-layer/list-app-logic",
                filePath: `./${aggregateName.toLowerCase()}-list-app-logic.ts`
            }),
            [DetailCapability.identifier]: new DetailAppLayerTemplateProcessor({
                templatePath: "./detail/application-layer/detail-app-logic",
                filePath: `./${aggregateName.toLowerCase()}-detail-app-logic.ts`
            }),
            [DeleteInstanceCapability.identifier]: new DeleteAppLayerTemplateProcessor({
                templatePath: "./delete/application-layer/delete-instance-app-logic",
                filePath: `./${aggregateName.toLowerCase()}-delete-instance-app-logic.ts`
            }),
            [CreateInstanceCapability.identifier]: new CreateInstanceAppLayerTemplateProcessor({
                templatePath: "./create/application-layer/create-instance-app-logic",
                filePath: `./${aggregateName.toLowerCase()}-create-instance-app-logic.ts`
            })
        }

        const appLayerGeneratorChoice = appLayerGenerators[capabilityIdentifier];

        if (!appLayerGeneratorChoice) {
            throw new Error(`No matching application layer generator has been found for "${capabilityIdentifier}"!`);
        }

        return appLayerGeneratorChoice;
    }
}