import {
  RdfSourceWrap,
  RdfResourceLoader,
  RdfResourceLoaderResult,
} from "../../../core/adapter/rdf/index.ts";
import { PimSchema } from "../../model/index.ts";
import * as PIM from "../../pim-vocabulary.ts";

export class PimSchemaAdapter implements RdfResourceLoader {
  async shouldLoadResource(source: RdfSourceWrap): Promise<boolean> {
    const types = await source.types();
    return types.includes(PIM.SCHEMA);
  }

  async loadResource(source: RdfSourceWrap): Promise<RdfResourceLoaderResult> {
    const result = new PimSchema(source.iri);
    result.pimHumanLabel = await source.languageString(PIM.HAS_HUMAN_LABEL);
    result.pimHumanDescription = await source.languageString(
      PIM.HAS_HUMAN_DESCRIPTION
    );
    result.pimParts = await source.nodesExtended(PIM.HAS_PART);
    return {
      resource: result,
      references: [...result.pimParts],
    };
  }
}
