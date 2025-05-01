import { createLogger } from "./logging";
import { translations } from "./localization-translations";

const LOG = createLogger(import.meta.url);

export type TranslationFunction = (text: string, ...args: unknown[]) => string;

export const t: TranslationFunction = (text, ...args) => {
  const result = translations[text];
  if (result === undefined) {
    LOG.missingTranslation(text);
    return text;
  } else  if (result instanceof Function) {
    return result(...args);
  } else {
    return result;
  }
};
