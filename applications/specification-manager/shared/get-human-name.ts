import {CoreResourceReader, LanguageString} from "@model-driven-data/core/core";
import {DataPsmClass, DataPsmSchema} from "@model-driven-data/core/data-psm/model";
import {PimClass, PimSchema} from "@model-driven-data/core/pim/model";

export function selectLanguage(input: LanguageString, languages: readonly string[]): string | undefined {
  for (const language of languages) {
    if (input[language]) {
      return input[language];
    }
  }

  // noinspection LoopStatementThatDoesntLoopJS
  for (const language in input) {
    return input[language];
  }

  return undefined;
}

/**
 * Get most suitable human name for given data psm schema.
 * @param reader
 * @param dataPsmSchemaIri
 * @param languagePreferences List of languages to use for name selection.
 */
export async function getNameForDataPsmSchema(
  reader: CoreResourceReader,
  dataPsmSchemaIri: string,
  languagePreferences: readonly string[]
): Promise<string | undefined> {
  let name: string | undefined;

  const dataPsmSchema = await reader.readResource(dataPsmSchemaIri) as DataPsmSchema;
  if (!dataPsmSchema) return undefined;
  name = selectLanguage(dataPsmSchema.dataPsmHumanLabel ?? {}, languagePreferences);
  if (name) return name;

  if (!dataPsmSchema.dataPsmRoots[0]) return undefined;
  const dataPsmRoot = await reader.readResource(dataPsmSchema.dataPsmRoots[0]) as DataPsmClass;
  if (!dataPsmRoot) return undefined;
  name = selectLanguage(dataPsmRoot.dataPsmHumanLabel ?? {}, languagePreferences);
  if (name) return name;

  if (!dataPsmRoot.dataPsmInterpretation) return undefined;
  const pimRoot = await reader.readResource(dataPsmRoot.dataPsmInterpretation) as PimClass;
  if (!pimRoot) return undefined;
  return selectLanguage(pimRoot.pimHumanLabel ?? {}, languagePreferences);
}

/**
 * Get most suitable human name for given pim schema.
 * @param reader
 * @param pimSchemaIri
 * @param languagePreferences List of languages to use for name selection.
 */
export async function getNameForPimSchema(
  reader: CoreResourceReader,
  pimSchemaIri: string,
  languagePreferences: readonly string[]
): Promise<string | undefined> {
  const pimSchema = await reader.readResource(pimSchemaIri) as PimSchema;
  if (!pimSchema) return undefined;
  return selectLanguage(pimSchema.pimHumanLabel ?? {}, languagePreferences);
}
