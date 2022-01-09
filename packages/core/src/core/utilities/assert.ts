export function assertFailed(message: string) {
  throw Error("Assert failed: " + message);
}

export function assertNot(condition: boolean, message: string): void {
  assert(!condition, message);
}

export function assert(condition: boolean, message: string): void {
  if (condition) {
    return;
  }
  assertFailed("Assert failed: " + message);
}
