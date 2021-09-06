import {IriProvider} from "./iri-provider";

const prefix = "pim:";

export class PrefixIriProvider implements IriProvider {
  cimToPim(cimIri: string): string {
    return prefix + cimIri;
  }

  pimToCim(pimIri: string): string {
    if (!pimIri.startsWith(prefix)) {
      throw new Error(`Unable to convert PIM iri ${pimIri} to CIM iri. Expected ${prefix} prefix.`);
    }

    return pimIri.substr(prefix.length);
  }

}
