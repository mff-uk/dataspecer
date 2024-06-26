import Handlebars from "handlebars";
import { isSemanticModelClass, isSemanticModelGeneralization } from '../semantic-model/concepts/concepts-utils';
// @ts-ignore
import { LanguageString, SemanticModelEntity } from "../semantic-model/concepts";
import { getTranslation } from "../utils/language";

export interface DocumentationGeneratorConfiguration {
  template: string;
  language: string;
}

function normalizeLabel(label: string) {
  return label.replace(/ /g, "-").toLowerCase();
}

interface ModelDescription {
  isPrimary: boolean;
  documentationUrl: string | null;
  entities: Record<string, SemanticModelEntity>;
  baseIri: string | null;
}

export async function generateDocumentation(
  inputModel: {
    resourceModel: any,
    models: ModelDescription[],
    modelIri: string,
    externalArtifacts: Record<string, {
      type: string,
      URL: string,
    }[]>,
    dsv: any | null,
  },
  configuration: DocumentationGeneratorConfiguration,
): Promise<string> {
  // Primary semantic model
  const semanticModel = {};
  for (const model of inputModel.models) {
    if (model.isPrimary) {
      Object.assign(semanticModel, model.entities);
    }
  }

  const data = {
    package: await inputModel.resourceModel.getPackage(inputModel.modelIri),
    locallyDefinedSemanticEntity: semanticModel,
    dsv: inputModel.dsv,

    // The goal of the given documentation
    target: {
      vocabulary: true,
      applicationProfile: false,
    },

    externalArtifacts: inputModel.externalArtifacts,
  };


  const handlebars = Handlebars; //AsyncHelpers(Handlebars) as typeof Handlebars;

  handlebars.registerHelper('ifEquals', function(arg1: any, arg2: any, options: any) {
    // @ts-ignore
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
  });

  /**
   * Provides an easy way to translate language strings based on the current language.
   */
  handlebars.registerHelper('translate', function(languageString: LanguageString | null | undefined, options: Handlebars.HelperOptions) {
    let translation = "";
    let translationLang: string | null = configuration.language;

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
        otherLang: translationLang === configuration.language ? null : translationLang,
      });
    }
  });

  const currentLang  = configuration.language;
  const HANDLEBARS_MARK_ENABLE = "#HANDLEBARS_DATASPECER_ENABLE#";
  const HANDLEBARS_MARK_DISABLE = "#HANDLEBARS_DATASPECER_DISABLE#";

  /**
   * {{#iflng "cs"}} Já jsem Pepina (chro) {{lng "de"}} Ich bin Peppa Wutz (grunz) {{lng}} I'm Peppa Pig (oinks) {{/iflng}}
   */
  handlebars.registerHelper('lng', function(this: {__handlebars_iflng_foundLanguage: boolean}, ...params: any[]) {
    let lng: string | null;
    let options: Handlebars.HelperOptions;
    if (params.length === 1) {
      lng = null;
      options = params[0];
    } else {
      lng = params[0];
      options = params[1];
    }

    if (lng === currentLang ||
      (lng === null && !this.__handlebars_iflng_foundLanguage)) {
      this.__handlebars_iflng_foundLanguage = true;
      return HANDLEBARS_MARK_ENABLE;
    } else {
      return HANDLEBARS_MARK_DISABLE;
    }
  });
  handlebars.registerHelper('iflng', function(this: any, lang: string, options: Handlebars.HelperOptions) {
    const context = {...this, __handlebars_iflng_foundLanguage: false} as {__handlebars_iflng_foundLanguage: boolean};

    context.__handlebars_iflng_foundLanguage = false;
    let result = "";
    if (lang === currentLang) {
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

  handlebars.registerHelper('semanticEntity', function(input: string, options: Handlebars.HelperOptions) {
    let entity: SemanticModelEntity | null = null;
    for (const model of inputModel.models) {
      if (Object.hasOwn(model.entities, input)) {
        entity = model.entities[input]!;
        break;
      }
      const entityByIri = Object.values(model.entities).find(entity => entity.iri === input);
      if (entityByIri) {
        entity = entityByIri;
        break;
      }
    }

    return entity ? options.fn(entity) : null;
  });

  function getAnchorForLocalEntity(entity: SemanticModelEntity): string | null {
    if (isSemanticModelClass(entity)) {
      const {ok, translation} = getTranslation(entity.name, [configuration.language]);
      if (ok) {
        return normalizeLabel(translation);
      }
    }

    // Fallback 
    return null;
  }

  /**
   * Generates link for the given entity.
   */
  handlebars.registerHelper('href', function(input: string, options: Handlebars.HelperOptions) {
    // todo: handle external links

    let inModel: ModelDescription | null = null;
    for (const model of inputModel.models) {
      if (Object.hasOwn(model.entities, input)) {
        inModel = model;
        break;
      }
    }
    const entity = inModel?.entities[input];

    if (inModel && entity) {
      if (inModel.isPrimary) {
        const anchor = getAnchorForLocalEntity(entity);
        return "#" + anchor;
      } else {
        if (inModel.documentationUrl) {
          const anchor = getAnchorForLocalEntity(entity);
          return inModel.documentationUrl + "#" + anchor;
        } else {
          return entity.iri;
        }
      }
    }

    // Last option
    return input;
  });

  /**
   * Generates anchor for the given entity that can be used as a link target.
   * 
   * It does not contain the # character. It is intended to be used as an id attribute.
   */
  handlebars.registerHelper('anchor', function(this: SemanticModelEntity) {
    // todo: handle colisions if multiple classes are named the same
    // todo: handle custom anchors
    // todo: handle stability of anchors - if new entitity with the same name is added, the anchor to the previous entity should not change

    const anchor = getAnchorForLocalEntity(this);
    if (anchor) {
      return anchor;
    }

    // Last option
    return this.id;
  });

  // Definition of custom helpers
  const definitions = {} as Record<string, Function>;
  handlebars.registerHelper('def', function() {
    const options = arguments[arguments.length-1];
    const args = Array.prototype.slice.call(arguments, 0, arguments.length-1);
    definitions[args[0]] = options.fn;
    return null;
  })
  handlebars.registerHelper('helperMissing', function() {
    const options = arguments[arguments.length-1];
    const args = Array.prototype.slice.call(arguments, 0, arguments.length-1);
    if (definitions[options.name]) {
      // @ts-ignore
      return new Handlebars.SafeString(definitions[options.name]!(this));
    }
  })

  handlebars.registerHelper('json', function(input: any) {
    return JSON.stringify(input, null, 2);
  });

  handlebars.registerHelper('console-log', function(input: any) {
    return console.log("Handlebars console log:", input);
  });

  handlebars.registerHelper('parentClasses', function(id: string) {
    let entities: SemanticModelEntity[] = [];
    for (const model of inputModel.models) {
      for (const entity of Object.values(model.entities)) {
        if (isSemanticModelGeneralization(entity)) {
          if (entity.child === id) {
            // Find entity in other model
            for (const model of inputModel.models) {
              if (Object.hasOwn(model.entities, entity.parent)) {
                entities.push(model.entities[entity.parent]!);
              }
            }
          }
        }
      }
    }
    return entities;
  });

  handlebars.registerHelper('subClasses', function(id: string) {
    let entities: SemanticModelEntity[] = [];
    for (const model of inputModel.models) {
      for (const entity of Object.values(model.entities)) {
        if (isSemanticModelGeneralization(entity)) {
          if (entity.parent === id) {
            model.entities[entity.child] && entities.push(model.entities[entity.child]!);
          }
        }
      }
    }
    return entities;
  });

  const compiledTemplate = handlebars.compile(configuration.template);
  const result = await compiledTemplate(data);
  return result;
}