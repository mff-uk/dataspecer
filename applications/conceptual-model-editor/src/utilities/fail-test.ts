/**
 * Fails test with the given message.
 *
 * @deprecated This is a Jest function that does not exist in Vitest.
 * Use throw new Error(message) instead.
 */
export function fail(message: string): never {
  throw new Error(message);
}