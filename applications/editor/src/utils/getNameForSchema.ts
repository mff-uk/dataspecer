import {DataPsmClass, DataPsmSchema} from "@dataspecer/core/data-psm/model";
import {PimClass} from "@dataspecer/core/pim/model";
import {selectLanguage} from "./selectLanguage";
import {CoreResourceReader} from "@dataspecer/core/core";

/**
 * For a given schema, store and languages, it tries to find a most suitable name for the current schema.
 * @param store
 * @param dataPsmSchemaIri
 * @param languages
 */
export async function getNameForSchema(store: CoreResourceReader, dataPsmSchemaIri: string, languages: readonly string[]): Promise<string | undefined> {
    let name: string | undefined;

    const dataPsmSchema = await store.readResource(dataPsmSchemaIri) as DataPsmSchema;
    if (!dataPsmSchema) return undefined;
    name = selectLanguage(dataPsmSchema.dataPsmHumanLabel ?? {}, languages);
    if (name) return name;

    if (!dataPsmSchema.dataPsmRoots[0]) return undefined;
    const dataPsmRoot = await store.readResource(dataPsmSchema.dataPsmRoots[0]) as DataPsmClass;
    if (!dataPsmRoot) return undefined;
    name = selectLanguage(dataPsmRoot.dataPsmHumanLabel ?? {}, languages);
    if (name) return name;

    if (!dataPsmRoot.dataPsmInterpretation) return undefined;
    const pimRoot = await store.readResource(dataPsmRoot.dataPsmInterpretation) as PimClass;
    if (!pimRoot) return undefined;
    return selectLanguage(pimRoot.pimHumanLabel ?? {}, languages);
}
