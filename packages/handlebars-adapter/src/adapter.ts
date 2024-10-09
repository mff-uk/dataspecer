import { LanguageString } from "@dataspecer/core/core/core-resource";
import handlebars from "handlebars";

export class HandlebarsAdapter {
  // todo: make private
  public readonly engine: typeof handlebars;
  private template: HandlebarsTemplateDelegate<any> | null = null;

  constructor() {
    this.engine = handlebars.create();

    const language = "cs";

    this.engine.registerHelper('dump', function (a) {
      return JSON.stringify(a);
    });

    this.engine.registerHelper('equals', function (a, b) {
      return a === b
    });

    this.engine.registerHelper('or', function (...props: any[]) {
      let result = false;
      props.pop();
      for (const prop of props) {
        if (prop) {
          result = true;
        }
      }
      return result;
    });

    this.engine.registerHelper('and', function (...props: any[]) {
      let result = true;
      props.pop();
      for (const prop of props) {
        if (!prop) {
          result = false;
        }
      }
      return result;
    });

    this.engine.registerHelper('non-empty', function(o) {
      return o && Object.keys(o).length > 0;
    });

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
    // function name -> [arguments names, function]
    const definitions = {} as Record<string, [string[], (_this: any) => string]>;
    this.engine.registerHelper("def", function () {
      const options = arguments[arguments.length - 1];
      const args = Array.prototype.slice.call(
        arguments,
        0,
        arguments.length - 1
      );
      definitions[args[0]] = [args.slice(1), options.fn];
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
        const [argNames, func] = definitions[options.name]!;

        for (let i = 0; i < args.length && i < argNames.length; i++) {
          // @ts-ignore
          this[argNames[i]] = args[i];
        }
        // @ts-ignore
        return new handlebars.SafeString(func(this));
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
