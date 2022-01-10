
export interface InputStream {

  /**
   * Return null if there are no additional data.
   * If size is not set all data are read.
   */
  read(size?: number): Promise<string | null>;

  /**
   * After this call no other action can be invoked.
   */
  close(): Promise<void>;

}
