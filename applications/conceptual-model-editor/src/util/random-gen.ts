
// TODO: Used mostly for get IRI, we need to respect length.
export const getRandomName = (_length = 12) => {
  return createUUID();
};

// Source: https://gist.github.com/ifandelse/3031112
function createUUID() {
  const result: string[] = [];
  const hexDigits = "0123456789abcdef";
  for (let i = 0; i < 36; i++) {
    result[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  // Bits 12-15 of the time_hi_and_version field to 0010
  result[14] = "4";
  // Bits 6-7 of the clock_seq_hi_and_reserved to 01
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  result[19] = hexDigits.substr(((result[19] as any) & 0x3) | 0x8, 1);
  result[8] = result[13] = result[18] = result[23] = "-";
  return result.join("");
}

export const getRandomNumberInRange = (min: number, max: number) => {
  //  Get number between min and max
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
