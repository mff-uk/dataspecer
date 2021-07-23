export function assert(condition: boolean, message: string) {
  if (condition) {
    return;
  }
  throw Error("Assert failed: " + message);
}
