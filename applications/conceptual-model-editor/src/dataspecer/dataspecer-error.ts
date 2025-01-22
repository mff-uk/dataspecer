
/**
 * Base exception to be used in all the method in this directory.
 */
export class DataspecerError extends Error {

  /**
   * Message arguments.
   */
  readonly args: any[];

  /**
   * @param message Message for translation.
   * @param args Translation arguments.
   */
  constructor(message: string, ...args: any[]) {
    super(message);
    this.args = args;
  }

}
