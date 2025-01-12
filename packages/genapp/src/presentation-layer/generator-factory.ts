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

/**
 * A definition of the factory for creating instances of PresentationLayerGenerator type. The factories of this type implement
 * the method responsible for the instantiation of the specific presentation layer generators.
 */
export type PresentationLayerGeneratorFactory = {
    /**
     * Retrieves the appropriate presentation layer generator from the provided capability identifier.
     * @param aggregateMetadata - The object containing data about the aggregate used usually to derive the name for the component file.
     * @param capabilityIdentifier - The identifier representing the capability for which the generator will be selected.
     * @returns The corresponding `PresentationLayerGenerator` generator instance.
     */
    getPresentationLayerGenerator: (aggregateMetadata: AggregateMetadata, capabilityIdentifier: string) => PresentationLayerGenerator;
}

/**
 * Factory object used for instantiation of presentation layer generator for the requested
 * capability identified by its IRI identifier.
 */
export const PresentationLayerTemplateGeneratorFactory: PresentationLayerGeneratorFactory = {
    /**
     * @inheritdoc
     * @throws Will throw an error if no presentation layer generator is found for the provided identifier.
     */

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