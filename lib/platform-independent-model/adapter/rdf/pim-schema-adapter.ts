import {RdfSourceWrap, RdfResourceAdapter} from "../../../core/adapter/rdf";
import {CoreResource} from "../../../core";
import {PimSchema, asPimSchema} from "../../model";
import * as PIM from "./pim-vocabulary";

export class PimSchemaAdapter implements RdfResourceAdapter {

  async loadResource(
    source: RdfSourceWrap, resource: CoreResource
  ): Promise<string[]> {
    const types = await source.types();
    if (!types.includes(PIM.SCHEMA)) {
      return [];
    }
    //
    const pimSchema: PimSchema = asPimSchema(resource);
    //
    pimSchema.pimHumanLabel =
      await source.languageString(PIM.HAS_HUMAN_LABEL);
    pimSchema.pimHumanDescription =
      await source.languageString(PIM.HAS_HUMAN_DESCRIPTION);
    pimSchema.pimParts = await source.nodesExtended(PIM.HAS_PART)
    return [...pimSchema.pimParts];
  }

}
