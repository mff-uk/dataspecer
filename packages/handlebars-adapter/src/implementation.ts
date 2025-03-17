import { LanguageString } from "@dataspecer/core/core";
import { BaseHandlebarsAdapter } from "./base";
import { HandlebarsAdapter } from "./interface";
import Handlebars from "handlebars";

export class RichHandlebarsAdapter extends BaseHandlebarsAdapter {
  prepareBasic() {
    // Boolean operations and helpers

    this.engine.registerHelper("equals", function (a, b) {
      return a === b;
    });

    this.engine.registerHelper("or", function (...props: any[]) {
      let result = false;
      props.pop();
      for (const prop of props) {
        if (prop) {
          result = true;
        }
      }
      return result;
    });

    this.engine.registerHelper("and", function (...props: any[]) {
      let result = true;
      props.pop();
      for (const prop of props) {
        if (!prop) {
          result = false;
        }
      }
      return result;
    });

    this.engine.registerHelper("not", function (value: any[]) {
      return !value;
    });

    this.engine.registerHelper("ifEquals", function (this: unknown, arg1: unknown, arg2: unknown, options: Handlebars.HelperOptions) {
      return arg1 == arg2 ? options.fn(this) : options.inverse(this);
    });

    // Other

    this.engine.registerHelper("non-empty", function (o) {
      return o && Object.keys(o).length > 0;
    });

    this.engine.registerHelper('json', function(input: any) {
      const cache = [] as any[];
      return JSON.stringify(input, (_, value) => {
        if (typeof value === 'object' && value !== null) {
          // Duplicate reference found, discard key
          if (cache.includes(value)) return;

          // Store value in our collection
          cache.push(value);
        }
        return value;
      }, 2);
    });

    this.engine.registerHelper('console-log', function(input: any) {
      return console.log("Handlebars console log:", input);
    });
  }

  /**
   * Current language during the render process.
   * The value may change when rendering.
   */
  protected currentLanguage: string = "en";

  prepareTranslations() {
    const parentThis = this;

    this.engine.registerHelper("setCurrentLanguage", (...params: any[]) => {
      if (params.length !== 2 || typeof params[0] !== "string") {
        throw new Error("setCurrentLanguage helper requires a single argument language.");
      }
      const [language, options] = params as [string, Handlebars.HelperOptions];

      // @ts-ignore bad types, may be undefined if called as non-block
      if (options.fn) {
        const lastLanguage = this.currentLanguage;
        this.currentLanguage = language;
        const result = options.fn(this);
        this.currentLanguage = lastLanguage;
        return result;
      } else {
        this.currentLanguage = language;
      }
    });

    /**
     * Provides an easy way to translate language strings based on the current language.
     */
    this.engine.registerHelper("translate", function (this: unknown, ...params) {
      let languageString: LanguageString | string | null | undefined;
      let options: Handlebars.HelperOptions;
      if (params.length === 1) {
        [options] = params as any;
        languageString = this as LanguageString | null | undefined;
      } else {
        [languageString, options] = params as any;
      }

      let translation = "";
      let translationLang: string | null = parentThis.currentLanguage;

      languageString = languageString || {};

      if (typeof languageString === "string") {
        languageString = { [parentThis.currentLanguage]: languageString };
      }


      if (Object.hasOwn(languageString, translationLang)) {
        translation = languageString[translationLang]!;
      } else if (Object.keys(languageString).length > 0) {
        translationLang = Object.keys(languageString)[0]!;
        translation = languageString[translationLang]!;
      } else {
        translationLang = null;
      }


      if (!options.fn) {
        return translation;
      }

      if (translationLang === null) {
        return options.inverse(null);
      } else {
        return options.fn({
          translation,
          lang: translationLang,
          otherLang: translationLang === parentThis.currentLanguage ? null : translationLang,
        });
      }
    });

    const HANDLEBARS_MARK_ENABLE = "#HANDLEBARS_DATASPECER_ENABLE#";
    const HANDLEBARS_MARK_DISABLE = "#HANDLEBARS_DATASPECER_DISABLE#";

    /**
     * {{#iflng "cs"}} Já jsem Pepina (chro) {{lng "de"}} Ich bin Peppa Wutz (grunz) {{lng}} I'm Peppa Pig (oinks) {{/iflng}}
     */
    this.engine.registerHelper("lng", function (this: { __handlebars_iflng_foundLanguage: boolean }, ...params: any[]) {
      let lng: string | null;
      let options: Handlebars.HelperOptions;
      if (params.length === 1) {
        lng = null;
        options = params[0];
      } else {
        lng = params[0];
        options = params[1];
      }

      if (lng === parentThis.currentLanguage || (lng === null && !this.__handlebars_iflng_foundLanguage)) {
        this.__handlebars_iflng_foundLanguage = true;
        return HANDLEBARS_MARK_ENABLE;
      } else {
        return HANDLEBARS_MARK_DISABLE;
      }
    });
    this.engine.registerHelper("iflng", function (this: any, lang: string, options: Handlebars.HelperOptions) {
      const context = { ...this, __handlebars_iflng_foundLanguage: false } as { __handlebars_iflng_foundLanguage: boolean };

      context.__handlebars_iflng_foundLanguage = false;
      let result = "";
      if (lang === parentThis.currentLanguage) {
        context.__handlebars_iflng_foundLanguage = true;
        result += HANDLEBARS_MARK_ENABLE;
      } else {
        result += HANDLEBARS_MARK_DISABLE;
      }

      result += options.fn(context);
      result += HANDLEBARS_MARK_DISABLE;

      // Return string between HANDLEBARS_MARK_ENABLE and HANDLEBARS_MARK_DISABLE
      const start = result.indexOf(HANDLEBARS_MARK_ENABLE) + HANDLEBARS_MARK_ENABLE.length;
      const end = result.indexOf(HANDLEBARS_MARK_DISABLE, start);

      if (result.indexOf(HANDLEBARS_MARK_ENABLE) === -1) {
        return "";
      } else {
        return result.substring(start, end);
      }
    });
  }

  prepareDef() {
    // Definition of custom helpers
    const definitions = {} as Record<string, [string[], (_this: any) => string]>;

    this.engine.registerHelper("def", function () {
      const options = arguments[arguments.length - 1];
      const args = Array.prototype.slice.call(arguments, 0, arguments.length - 1);
      definitions[args[0]] = [args.slice(1), options.fn];
      return null;
    });
    this.engine.registerHelper("helperMissing", function (this: any) {
      const options = arguments[arguments.length - 1];
      const args = Array.prototype.slice.call(arguments, 0, arguments.length - 1);
      if (definitions[options.name]) {
        const [argNames, func] = definitions[options.name]!;
        if (typeof this !== "string") {
          this.args = args;

          for (let i = 0; i < args.length && i < argNames.length; i++) {
            this[argNames[i]!] = args[i];
          }
        }
        return new Handlebars.SafeString(func(this));
      }
    });
  }

  render(template: string, data: object, templates: Record<string, string>): Promise<string> {
    const language = (data as any)["language"];
    this.currentLanguage = language ?? this.currentLanguage;
    return super.render(template, data, templates);
  }
}

export function createHandlebarsAdapter(): HandlebarsAdapter {
  const adapter = new RichHandlebarsAdapter();
  adapter.prepareBasic();
  adapter.prepareTranslations();
  adapter.prepareDef();
  return adapter;
}
