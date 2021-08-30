export function assertNot(condition: boolean, message: string) {
  assert(!condition, message);
}

export function assert(condition: boolean, message: string) {
  if (condition) {
    return;
  }
  throw Error("Assert failed: " + message);
}
