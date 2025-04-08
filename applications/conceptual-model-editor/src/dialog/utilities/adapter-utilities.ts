
/**
 * Return a null when given value is null or an empty string,
 * else return the given value.
 */
export function emptyAsNull(value: string | null) : string | null {
  if (value === null || value.trim().length === 0) {
    return null;
  }
  return value;
}
