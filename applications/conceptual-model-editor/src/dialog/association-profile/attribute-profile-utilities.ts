import { isSemanticModelRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { ClassesContextType } from "../../context/classes-context";
import { ModelGraphContextType } from "../../context/model-context";
import { CmeModel } from "../../dataspecer/cme-model";
import { isRepresentingAssociation, representOwlThing, representRdfsLiteral, representRelationshipProfile, representRelationshipUsages, representRelationships } from "../utilities/dialog-utilities";

export function listAssociationsToProfile(
  classesContext: ClassesContextType,
  graphContext: ModelGraphContextType,
  vocabularies: CmeModel[],
) {
  const entities = graphContext.aggregatorView.getEntities();
  const models = [...graphContext.models.values()];

  const owlThing = representOwlThing();

  const rdfsLiteral = representRdfsLiteral();

  return [
    ...representRelationships(models, vocabularies,
      classesContext.relationships,
      owlThing.identifier, rdfsLiteral.identifier),
    ...representRelationshipUsages(entities, models, vocabularies,
      classesContext.usages.filter(item => isSemanticModelRelationshipUsage(item)),
      owlThing.identifier, rdfsLiteral.identifier),
    ...representRelationshipProfile(entities, models, vocabularies,
      classesContext.relationshipProfiles)
  ].filter(isRepresentingAssociation);
}
