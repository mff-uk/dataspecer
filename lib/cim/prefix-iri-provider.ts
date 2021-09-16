import {IriProvider} from "./iri-provider";

const PREFIX = "pim:";

export class PrefixIriProvider implements IriProvider {

  cimToPim(cimIri: string): string {
    return PREFIX + cimIri;
  }

  pimToCim(pimIri: string): string {
    if (!pimIri.startsWith(PREFIX)) {
      throw new Error(
        `Unable to convert PIM iri ${pimIri} to CIM iri.`
        + `Expected ${PREFIX} prefix.`);
    }

    return pimIri.substr(PREFIX.length);
  }

}
