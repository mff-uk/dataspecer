import {CoreResourceReader} from "@dataspecer/core/core";
import {CLASS} from "@dataspecer/core/pim/pim-vocabulary";
import {PimClass} from "@dataspecer/core/pim/model";

/**
 * Returns the IRI of the PIM class having the interpretation
 * @param reader
 * @param cimIri
 */
export async function getPimHavingInterpretation(
  reader: CoreResourceReader,
  cimIri: string,
): Promise<string | null> {
  const resources = await reader.listResourcesOfType(CLASS);
  for (const resource of resources) {
    const cls = await reader.readResource(resource) as PimClass;
    if (cls.pimInterpretation === cimIri) {
      return resource;
    }
  }
  return null;
}
