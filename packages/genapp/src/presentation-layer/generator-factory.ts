import { AggregateMetadata } from "../application-config";
import {
    CREATE_CAPABILITY_ID,
    DELETE_CAPABILITY_ID,
    DETAIL_CAPABILITY_ID,
    EDIT_CAPABILITY_ID,
    LIST_CAPABILITY_ID
} from "../capabilities";
import { PresentationLayerGenerator } from "./strategy-interface";
import {
    CreateComponentGenerator,
    DeleteComponentGenerator,
    DetailComponentGenerator,
    EditComponentGenerator,
    ListComponentGenerator,
} from "./template-generators";

export type PresentationLayerGeneratorFactory = {
    getPresentationLayerGenerator: (aggregateMetadata: AggregateMetadata, capabilityIdentifier: string) => PresentationLayerGenerator;
}

export const PresentationLayerTemplateGeneratorFactory: PresentationLayerGeneratorFactory = {
    getPresentationLayerGenerator(aggregateMetadata: AggregateMetadata, capabilityIri: string): PresentationLayerGenerator {

        const pascalCaseAggregateName = aggregateMetadata.getAggregateNamePascalCase();

        const capabilityGeneratorMap: { [capabilityIri: string] : PresentationLayerGenerator } = {
            [LIST_CAPABILITY_ID]: new ListComponentGenerator(`${pascalCaseAggregateName}ListTable.tsx`),
            [DETAIL_CAPABILITY_ID]: new DetailComponentGenerator(`${pascalCaseAggregateName}InstanceDetail.tsx`),
            [CREATE_CAPABILITY_ID]: new CreateComponentGenerator(`Create${pascalCaseAggregateName}Instance.tsx`),
            [DELETE_CAPABILITY_ID]: new DeleteComponentGenerator(`Delete${pascalCaseAggregateName}Instance.tsx`),
            [EDIT_CAPABILITY_ID]: new EditComponentGenerator(`Edit${pascalCaseAggregateName}Instance.tsx`)
        }

        const generator = capabilityGeneratorMap[capabilityIri];

        if (!generator) {
            throw new Error(`Unable to find template generator for "${capabilityIri}"`);
        }

        return generator;
    }
}