import { SemanticModelAggregatorView } from "@dataspecer/core-v2/semantic-model/aggregator";
import { UiClass, UiClassProfile, UiGeneralization, UiRelationship, UiRelationshipProfile, UiSemanticModel } from "./model";
import { cmeClassAggregateToUiClassProfile, cmeClassToUiClass, cmeGeneralizationToCmeGeneralization, cmeRelationshipAggregateToUiRelationshipProfile, cmeRelationshipToUiRelationship, semanticModelMapToCmeSemanticModel } from "./adapter";
import { HexColor, VisualModel } from "@dataspecer/core-v2/visual-model";
import { SemanticModel } from "../semantic-model";
import { createLogger } from "../../application";
import { createUiAdapterContext } from "./adapter/adapter-context";
import { isSemanticModelClass, isSemanticModelGeneralization, isSemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { isSemanticModelClassProfile, isSemanticModelRelationshipProfile } from "@dataspecer/core-v2/semantic-model/profile/concepts";
import { semanticClassToCmeClass, semanticGeneralizationToCmeGeneralization, semanticRelationshipToCmeRelationship } from "../cme-model/adapter";
import { semanticClassProfileToCmeClassAggregate } from "../cme-model/adapter/cme-class-profile-aggregate";
import { semanticRelationshipProfileToCmeRelationshipAggregate } from "../cme-model/adapter/cme-relationship-aggregate-adapter";

const LOG = createLogger(import.meta.url);

export interface UiModelState {

  semanticModels: UiSemanticModel[];

  classes: UiClass[];

  classProfiles: UiClassProfile[];

  relationships: UiRelationship[];

  relationshipProfiles: UiRelationshipProfile[];

  generalizations: UiGeneralization[];

}

export function createEmptyUiModelState(): UiModelState {
  return {
    semanticModels: [],
    classes: [],
    classProfiles: [],
    relationships: [],
    relationshipProfiles: [],
    generalizations: [],
  };
}

export function createUiModelState(
  aggregatorView: SemanticModelAggregatorView,
  semanticModels: SemanticModel[],
  language: string,
  languagePreferences: string[],
  visualModel: VisualModel | null,
  defaultModelColor: HexColor,
): UiModelState {
  const state = createEmptyUiModelState();

  // Prepare context.
  const context = createUiAdapterContext(
    language, languagePreferences, visualModel,
    defaultModelColor, semanticModels);

  // Models
  state.semanticModels = semanticModelMapToCmeSemanticModel(
    context, semanticModels);

  // Entities
  const entities = aggregatorView.getEntities();
  for (const model of semanticModels) {
    const modelIdentifier = model.getId();
    for (const entityIdentifier of Object.keys(model.getEntities())) {
      const wrap = entities[entityIdentifier];
      const raw = wrap.rawEntity;
      const entity = wrap.aggregatedEntity;
      //
      if (isSemanticModelGeneralization(entity)) {
        const cme = semanticGeneralizationToCmeGeneralization(
          modelIdentifier, entity);
        state.generalizations.push(
          cmeGeneralizationToCmeGeneralization(context, cme));
      } else if (isSemanticModelClass(entity)) {
        const cme = semanticClassToCmeClass(
          modelIdentifier, entity);
        state.classes.push(
          cmeClassToUiClass(context, cme));
      } else if (isSemanticModelClassProfile(raw)
        && isSemanticModelClassProfile(entity)) {
        const cme = semanticClassProfileToCmeClassAggregate(
          modelIdentifier, raw, entity);
        state.classProfiles.push(
          cmeClassAggregateToUiClassProfile(context, cme));
      } else if (isSemanticModelRelationship(entity)) {
        const cme = semanticRelationshipToCmeRelationship(
          modelIdentifier, entity);
        state.relationships.push(
          cmeRelationshipToUiRelationship(context, cme));
      } else if (isSemanticModelRelationshipProfile(raw)
        && isSemanticModelRelationshipProfile(entity)) {
        const cme = semanticRelationshipProfileToCmeRelationshipAggregate(
          modelIdentifier, raw, entity);
        state.relationshipProfiles.push(
          cmeRelationshipAggregateToUiRelationshipProfile(context, cme));
      } else {
        LOG.invalidEntity(entityIdentifier, "Can not determine type.",
          { wrap });
      }
    }
  }
  return state;
}

