
export const cx = (...args: any[]): string => {
  let result: string = "";
  for (const item of args) {
    if (typeof item === "string") {
      result += " " + item;
    }
  }
  return result;
};