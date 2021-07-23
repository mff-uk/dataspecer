import {RdfSourceWrap} from "../../rdf-source-wrap"
import {RdfResourceAdapter} from "../../rdf-adapter-api";
import {CoreResource, PsmSchema} from "../../../../model";
import * as PSM from "./psm-vocabulary";

export class PsmSchemaAdapter implements RdfResourceAdapter {

  async loadResource(
    source: RdfSourceWrap, resource: CoreResource
  ): Promise<string[]> {
    const types = await source.types();
    if (!types.includes(PSM.SCHEMA)) {
      return [];
    }
    //
    const psmSchema: PsmSchema = PsmSchema.as(resource);
    //
    psmSchema.psmTechnicalLabel =
      (await source.literal(PSM.HAS_TECHNICAL_LABEL))?.value as string;
    psmSchema.psmHumanLabel =
      await source.languageString(PSM.HAS_HUMAN_LABEL);
    psmSchema.psmHumanDescription =
      await source.languageString(PSM.HAS_HUMAN_DESCRIPTION);
    psmSchema.psmRoots = await source.nodesExtended(PSM.HAS_ROOT)
    return [...psmSchema.psmRoots];
  }

}
