
const WhitespaceRegExp = new RegExp(/\s+/g);

/**
 * camelCase
 */
export const lowerCamelCase = (value: string): string => {
  const parts = value.toLocaleLowerCase()
    .split(WhitespaceRegExp)
    .map(capitalizeFirstLetter);
  if (parts.length === 0 || parts[0] === undefined) {
    return "";
  }
  // Lower first letter.
  parts[0] = parts[0].charAt(0).toLocaleLowerCase() + parts[0].slice(1);
  return parts.join("");
};

const capitalizeFirstLetter = (value: string): string  => {
  return value.charAt(0).toLocaleUpperCase() + value.slice(1);
};

/**
 * CamelCase
 */
export const upperCamelCase = (value: string): string => {
  const parts = value.toLocaleLowerCase()
    .split(WhitespaceRegExp)
    .map(capitalizeFirstLetter);
  return parts.join("");
};

/**
 * kebab-case
 */
export const kebabCase = (value: string): string => {
  return value.toLocaleLowerCase().replace(WhitespaceRegExp, "-");
};
