import Handlebars from "handlebars";
// @ts-ignore
import AsyncHelpers from "handlebars-async-helpers";
import { SemanticModelEntity } from "../semantic-model/concepts";

export interface DocumentationGeneratorConfiguration {
  template: string;
}

export async function generateDocumentation(
  inputModel: {
    resourceModel: any,
    semanticModels: Record<string, SemanticModelEntity>[],
    modelIri: string,
  },
  configuration: DocumentationGeneratorConfiguration,
): Promise<string> {
  const data = {
    package: await inputModel.resourceModel.getPackage(inputModel.modelIri),
    semanticModels: inputModel.semanticModels,
  };

  const handlebars = AsyncHelpers(Handlebars);

  handlebars.registerHelper('ifEquals', function(arg1: any, arg2: any, options: any) {
    // @ts-ignore
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
  });

  const compiledTemplate = handlebars.compile(configuration.template);
  const result = await compiledTemplate(data);
  return result;
}