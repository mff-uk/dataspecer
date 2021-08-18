export interface IdProvider {

  cimToPim(cimId: string): string;
  pimToCim(pimId: string): string;
  
}
