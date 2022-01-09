
export class DataSpecificationArtefact {

  iri: string | null = null;

  name: string | null = null;

  /**
   * Output path in the file system.
   */
  outputPath: string | null = null;

  /**
   * URL of the published document.
   */
  publicUrl: string | null = null;

  /**
   * Identification of a generator that is used to produce given
   * artefact.
   */
  generator: string | null = null;

}
