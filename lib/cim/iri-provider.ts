export interface IriProvider {

  cimToPim(cimId: string): string;
  pimToCim(pimId: string): string;
  
}
