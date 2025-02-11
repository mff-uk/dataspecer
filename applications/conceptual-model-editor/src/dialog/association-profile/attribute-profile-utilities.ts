import { isSemanticModelRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { ClassesContextType } from "../../context/classes-context";
import { ModelGraphContextType } from "../../context/model-context";
import { CmeModel } from "../../dataspecer/cme-model";
import { isRepresentingAttribute, representRelationshipProfiles, representRelationships } from "../utilities/dialog-utilities";

export function listAssociationsToProfile(
  classesContext: ClassesContextType,
  graphContext: ModelGraphContextType,
  vocabularies: CmeModel[],
) {
  const entities = graphContext.aggregatorView.getEntities();
  const models = [...graphContext.models.values()];

  return [
    ...representRelationships(models, vocabularies,
      classesContext.relationships),
    ...representRelationshipProfiles(entities, models, vocabularies,
      classesContext.usages.filter(item => isSemanticModelRelationshipUsage(item))),
  ].filter(item => !isRepresentingAttribute(item));
}
