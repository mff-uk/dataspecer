
/**
 * We use this as a single place to log events. The idea is that we have
 * all logging comming through our interface.
 *
 * For now we just call console to print into the console.
 */
export const logger = {
  error: (message: string, ...args: unknown[]) => {
    console.error(message, ...args);
  },
  warn: (message: string, ...args: unknown[]) => {
    console.error(message, ...args);
  },
  /**
   * Report missing translation value.
   */
  missingTranslation: (name: string) => {
    console.error(`[TRANSLATION] Missing for '${name}'.`);
  },
  /**
   * Report invalid entity.
   */
  invalidEntity: (identifier: string, message: string, ...args: unknown[]) => {
    console.error(`[ENTITY] '${identifier}' is not valid: ${message}`, ...args);
  },
};
