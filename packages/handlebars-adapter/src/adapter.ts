import { LanguageString } from "@dataspecer/core/core/core-resource";
import handlebars from "handlebars";

export class HandlebarsAdapter {
  private readonly engine: typeof handlebars;
  private template: HandlebarsTemplateDelegate<any> | null = null;

  constructor() {
    this.engine = handlebars.create();

    const language = "cs";

    this.engine.registerHelper(
      "translate",
      function (
        languageString: LanguageString | null | undefined,
        options: Handlebars.HelperOptions
      ) {
        let translation = "";
        let translationLang: string | null = language;

        languageString = languageString || {};

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
            otherLang: translationLang === language ? null : translationLang,
          });
        }
      }
    );

    // Definition of custom helpers
    const definitions = {} as Record<string, Function>;
    this.engine.registerHelper("def", function () {
      const options = arguments[arguments.length - 1];
      const args = Array.prototype.slice.call(
        arguments,
        0,
        arguments.length - 1
      );
      definitions[args[0]] = options.fn;
      return null;
    });
    this.engine.registerHelper("helperMissing", function () {
      const options = arguments[arguments.length - 1];
      const args = Array.prototype.slice.call(
        arguments,
        0,
        arguments.length - 1
      );
      // @ts-ignore
      this.args = args;
      if (definitions[options.name]) {
        // @ts-ignore
        return new handlebars.SafeString(definitions[options.name]!(this));
      }
    });
  }

  public async compile(template: string): Promise<void> {
    this.template = this.engine.compile(template);
  }

  public async render(data: object = {}): Promise<string> {
    if (!this.template) {
      throw new Error("Template not compiled");
    }
    return this.template(data);
  }
}
