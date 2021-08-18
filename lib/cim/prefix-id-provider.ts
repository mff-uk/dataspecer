import {IdProvider} from "./id-provider";

const prefix = "pim:";

export class PrefixIdProvider implements IdProvider {
  cimToPim(cimId: string): string {
    return prefix + cimId;
  }

  pimToCim(pimId: string): string {
    if (!pimId.startsWith(prefix)) {
      throw new Error(`Unable to convert PIM id ${pimId} to CIM id. Expected ${prefix} prefix.`);
    }

    return pimId.substr(prefix.length);
  }

}
