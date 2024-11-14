import {
  isSemanticModelAttribute,
  isSemanticModelClass,
  isSemanticModelGeneralization,
  isSemanticModelRelationship,
  LanguageString,
  SemanticModelClass,
  SemanticModelEntity,
  SemanticModelGeneralization,
  SemanticModelRelationship,
  SemanticModelRelationshipEnd,
} from "@dataspecer/core-v2/semantic-model/concepts";
import {
  isSemanticModelAttributeUsage,
  isSemanticModelClassUsage,
  isSemanticModelRelationshipUsage,
  SemanticModelClassUsage,
  SemanticModelRelationshipEndUsage,
  SemanticModelRelationshipUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";

import { ModelGraphContextType } from "../context/model-context";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { DialogApiContextType } from "../dialog/dialog-service";
import { Options } from "../application/options";
import { ChangedFieldsType, createEntityModifyDialog, DomainAndRangeContainer, getInitialOverriddenFields, ModifyEntityState, SupportedTypes } from "../dialog/obsolete/modify-entity-dialog";
import { ClassesContextType, UseClassesContextType } from "../context/classes-context";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { findSourceModelOfEntity } from "../service/model-service";
import { createRelationshipUsage, modifyClassUsage, modifyRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/operations";
import { OverriddenFieldsType } from "../util/profile-utils";
import { createGeneralization, createRelationship, deleteEntity, modifyClass, modifyRelation, Operation } from "@dataspecer/core-v2/semantic-model/operations";
import { EntityModel } from "@dataspecer/core-v2";
import { DomainAndRange, getDomainAndRange } from "../util/relationship-utils";

export function openModifyDialogAction(
  options: Options,
  dialogs: DialogApiContextType,
  notifications: UseNotificationServiceWriterType,
  classes: ClassesContextType,
  useClasses: UseClassesContextType,
  graph: ModelGraphContextType,
  identifier: string,
) {
  const entity = graph.aggregatorView.getEntities()?.[identifier].rawEntity;
  if (entity === undefined) {
    notifications.error(`Can not find the entity with identifier '${identifier}'.`);
    return;
  }
  // In future we should have different dialogs based on the type, for now
  // we just fall through to a single dialog for all.
  if (isSemanticModelClass(entity)) {

  } else if (isSemanticModelClassUsage(entity)) {

  } else if (isSemanticModelAttribute(entity)) {

  } else if (isSemanticModelAttributeUsage(entity)) {

  } else if (isSemanticModelRelationship(entity)) {

  } else if (isSemanticModelRelationshipUsage(entity)) {

  } else if (isSemanticModelGeneralization(entity)) {
    notifications.error(`Generalization modification is not supported!`);
    return;
  } else {
    notifications.error(`Unknown entity type.`);
    return;
  }
  //
  const onConfirm = (state: ModifyEntityState) => {
    saveChanges(useClasses, graph, state);
  };
  dialogs.openDialog(createEntityModifyDialog(
    classes, graph, entity, options.language, onConfirm));
};

const saveChanges = (
  classes: UseClassesContextType,
  graph: ModelGraphContextType,
  state: ModifyEntityState,
) => {
  const models = graph.models;
  const model = findSourceModelOfEntity(state.entity.id, models);
  const modifiedEntity = state.entity;
  const {
    iri,
    name,
    description,
    changedFields,
    overriddenFields,
    usageNote,
    domain,
    range,
    newAttributes,
    newAttributesProfile,
    newGeneralizations,
    attributesToRemove,
    specializationsToRemove,
    //
    initialOverriddenFields,
  } = state;

  if (!(model instanceof InMemorySemanticModel)) {
    alert("Model must be instance of InMemorySemanticModel!");
    return;
  }
  const operations: Operation[] = [];
  if (isSemanticModelClass(modifiedEntity)) {
    operations.push(...classChangesToOperations(
      modifiedEntity, changedFields,
      iri, name, description));
  } else if (isSemanticModelClassUsage(modifiedEntity)) {
    operations.push(...classUsageChangesToOperations(
      modifiedEntity, changedFields,
      overriddenFields, initialOverriddenFields,
      iri, name, description, usageNote));
  } else if (isSemanticModelRelationship(modifiedEntity)) {
    const currentDomainAndRange = getDomainAndRange(modifiedEntity);

    operations.push(...relationshipChangesToOperations(
      modifiedEntity, changedFields,
      iri, name, description,
      domain as SemanticModelRelationshipEnd,
      range as SemanticModelRelationshipEnd,
      currentDomainAndRange));
  } else if (isSemanticModelRelationshipUsage(modifiedEntity)) {
    const currentDomainAndRange = getDomainAndRange(modifiedEntity);

    operations.push(...relationshipUsageChangesToOperations(
      modifiedEntity, changedFields,
      overriddenFields, initialOverriddenFields,
      iri, name, description,
      domain as SemanticModelRelationshipEndUsage,
      range as SemanticModelRelationshipEndUsage,
      currentDomainAndRange, usageNote));
  }
  operations.push(...getAdditionalOperationsToExecute(
    model, models, classes.sourceModelOfEntityMap, modifiedEntity,
    newAttributes, newAttributesProfile,
    newGeneralizations,
    attributesToRemove,
    specializationsToRemove,
    classes.deleteEntityFromModel,
  ));
  // Make it happen.
  classes.executeMultipleOperations(model, operations);
};

/**
 * Given values and list of changed fields returns operations
 * for updating the class.
 */
const classChangesToOperations = (
  entity: SemanticModelClass,
  changedFields: ChangedFieldsType,
  iri: string | undefined,
  name: LanguageString,
  description: LanguageString,
): Operation[] => {
  const changes = {} as Partial<Omit<SemanticModelClass & SemanticModelClassUsage, "type" | "usageOf" | "id">>;

  if (changedFields.iri) {
    changes.iri = iri;
  }
  if (changedFields.name) {
    changes.name = name;
  }
  if (changedFields.description) {
    changes.description = description;
  }

  if (Object.entries(changes).length > 0) {
    return [modifyClass(entity.id, changes)];
  } else {
    return [];
  }
};

/**
 * Given values and list of changed fields returns operations
 * for updating the class profile.
 *
 * For name and description, also make sure that null is set
 * when method is no overridden.
 */
const classUsageChangesToOperations = (
  entity: SemanticModelClassUsage,
  changedFields: ChangedFieldsType,
  overriddenFields: OverriddenFieldsType,
  initialOverriddenFields: OverriddenFieldsType,
  iri: string | undefined,
  name: LanguageString,
  description: LanguageString,
  usageNote: LanguageString,
): Operation[] => {
  const changes = {} as Partial<Omit<SemanticModelClassUsage, "type" | "usageOf" | "id">>;

  if (changedFields.iri) {
    changes.iri = iri;
  }

  addValueToChangesWhenValueHasChanged(
    changedFields.name, overriddenFields.name, initialOverriddenFields.name,
    name, entity.name,
    changes, "name");
  addValueToChangesWhenValueHasChanged(
    changedFields.description, overriddenFields.description, initialOverriddenFields.description,
    description, entity.description,
    changes, "description");

  if (changedFields.usageNote) {
    changes.usageNote = usageNote;
  }

  // Return operation or nothing.
  if (Object.entries(changes).length > 0) {
    return [modifyClassUsage(entity.id, changes)];
  } else {
    return [];
  }
};

/**
 * Given information about a value write a new value to the changes list
 * under given name if there is a change in the value.
 */
const addValueToChangesWhenValueHasChanged = <T,>(
  hasChanged: boolean,
  overridden: boolean,
  initialOverridden: boolean,
  value: T,
  initialValue: T,
  changes: any,
  name: string,
): void => {
  const next = determineNextValue(hasChanged, overridden, initialOverridden, value);
  if (next.hasChanged) {
    // We could setter function instead, alternatively we should refactor
    // the caller function to deal with this instead.
    changes[name] = next.value;
  }
};

/**
 * Given information about a value determines next value and whether it has changed.
 */
const determineNextValue = <T,>(
  hasChanged: boolean,
  overridden: boolean,
  initialOverridden: boolean,
  value: T,
): {
  value: T | null,
  hasChanged: boolean,
} => {
  // We go case by case.
  if (initialOverridden) {
    if (overridden) {
      // overridden -> overridden
      return { value, hasChanged };
    } else {
      // overridden -> inherit
      return { value: null, hasChanged: true };
    }
  } else {
    if (overridden) {
      // inherit -> overridden
      return { value, hasChanged: true };
    } else {
      // inherit -> inherit
      return { value: null, hasChanged: false };
    }
  }
};

const relationshipChangesToOperations = (
  entity: SemanticModelEntity,
  changedFields: ChangedFieldsType,
  iri: string | undefined,
  name: LanguageString,
  description: LanguageString,
  domain: SemanticModelRelationshipEnd,
  range: SemanticModelRelationshipEnd,
  initialDomainAndRange: DomainAndRange<SemanticModelRelationshipEnd>,
): Operation[] => {

  // Get changes for the domain.
  let domainChanges = {} as Partial<Omit<SemanticModelRelationshipEnd, "type" | "id">>;
  domainChanges = changedFields.domainCardinality ? { ...domainChanges, cardinality: domain.cardinality } : domainChanges;
  domainChanges = changedFields.domain ? { ...domainChanges, concept: domain.concept } : domainChanges;

  // Get range changes.
  let rangeChanges = {} as Partial<Omit<SemanticModelRelationshipEnd, "type" | "id">>;
  rangeChanges = changedFields.iri ? { ...rangeChanges, iri: iri } : rangeChanges;
  rangeChanges = changedFields.name ? { ...rangeChanges, name: name } : rangeChanges;
  rangeChanges = changedFields.description ? { ...rangeChanges, description: description } : rangeChanges;
  rangeChanges = changedFields.range ? { ...rangeChanges, concept: range.concept } : rangeChanges;
  rangeChanges = changedFields.rangeCardinality ? { ...rangeChanges, cardinality: range.cardinality } : rangeChanges;

  // Merge original values with the changes, to construct full objects.
  const domainEnd: SemanticModelRelationshipEnd = {
    ...initialDomainAndRange.domain!,
    ...domainChanges,
  };
  const rangeEnd: SemanticModelRelationshipEnd = {
    ...initialDomainAndRange.range!,
    ...rangeChanges,
  };

  // Keep the same order of domain and range.
  let ends: SemanticModelRelationshipEnd[];
  if (initialDomainAndRange?.domainIndex == 1 && initialDomainAndRange?.rangeIndex == 0) {
    ends = [rangeEnd, domainEnd];
  } else {
    ends = [domainEnd, rangeEnd];
  }

  return [modifyRelation(entity.id, { ends })];
};

/**
* Just a function where to dump anything that does not fit into other
* any to operations functions.
*
* We should split this functions into logical parts and call the section from their respective parts.
*/
const getAdditionalOperationsToExecute = (
  model: InMemorySemanticModel,
  modelMap: Map<string, EntityModel>,
  entityToModelIdentifier: Map<string, string>,
  entity: SemanticModelEntity,
  newAttributes: Partial<Omit<SemanticModelRelationship, "type">>[],
  newAttributeProfiles: (Partial<Omit<SemanticModelRelationshipUsage, "type">> & Pick<SemanticModelRelationshipUsage, "usageOf">)[],
  newGeneralizations: Omit<SemanticModelGeneralization, "type" | "id">[],
  attributesToBeRemoved: string[],
  specializationsToBeRemoved: string[],
  deleteEntityFromModel: (model: InMemorySemanticModel, identifier: string) => void,
) => {
  const operations = [];
  if (isSemanticModelClass(entity) || isSemanticModelClassUsage(entity)) {
    for (const attribute of newAttributes) {
      operations.push(createRelationship(attribute));
    }
    for (const attributeProfile of newAttributeProfiles) {
      operations.push(createRelationshipUsage(attributeProfile));
    }
  }

  for (const Generalization of newGeneralizations) {
    operations.push(createGeneralization(Generalization));
  }

  // Attributes and generalizations can be from different models.
  // For such occasions they need to be removed from the model directly.
  for (const identifier of [...attributesToBeRemoved, ...specializationsToBeRemoved]) {
    const modelIdentifier = entityToModelIdentifier.get(identifier);
    if (modelIdentifier === undefined) {
      operations.push(deleteEntity(identifier));
      continue;
    }
    const ownerModel = modelMap.get(modelIdentifier);
    if (ownerModel instanceof InMemorySemanticModel && ownerModel.getId() != model?.getId()) {
      // We can delete directly .. not sure why.
      // TODO We should probably not do this, not sure why it is this way.
      deleteEntityFromModel(ownerModel, identifier);
    } else {
      operations.push(deleteEntity(identifier));
    }
  }
  return operations;
};

const relationshipUsageChangesToOperations = (
  entity: SemanticModelEntity,
  changedFields: ChangedFieldsType,
  overriddenFields: OverriddenFieldsType,
  initialOverriddenFields: OverriddenFieldsType,
  iri: string | undefined,
  name: LanguageString,
  description: LanguageString,
  domain: SemanticModelRelationshipEndUsage,
  range: SemanticModelRelationshipEndUsage,
  initialDomainAndRange: DomainAndRange<SemanticModelRelationshipEndUsage>,
  usageNote: LanguageString,
) => {
  // Get changes for the domain.
  const domainChanges = {} as Partial<Omit<SemanticModelRelationshipEndUsage, "type" | "id">>;
  addValueToChangesWhenValueHasChanged(
    changedFields.domain, overriddenFields.domain, initialOverriddenFields.domain,
    domain.concept, initialDomainAndRange.domain?.concept,
    domainChanges, "concept");
  addValueToChangesWhenValueHasChanged(
    changedFields.domainCardinality, overriddenFields.domainCardinality, initialOverriddenFields.domainCardinality,
    domain.cardinality, initialDomainAndRange.domain?.cardinality,
    domainChanges, "cardinality");

  // Get range changes.
  let rangeChanges = {} as Partial<Omit<SemanticModelRelationshipEndUsage, "type" | "id">>;
  rangeChanges = changedFields.iri ? { ...rangeChanges, iri: iri } : rangeChanges;
  addValueToChangesWhenValueHasChanged(
    changedFields.name, overriddenFields.name, initialOverriddenFields.name,
    name, range.name,
    rangeChanges, "name");
  addValueToChangesWhenValueHasChanged(
    changedFields.description, overriddenFields.description, initialOverriddenFields.description,
    description, range.description,
    rangeChanges, "description");
  addValueToChangesWhenValueHasChanged(
    changedFields.range, overriddenFields.range, initialOverriddenFields.range,
    range.concept, initialDomainAndRange.range?.concept,
    rangeChanges, "concept");
  addValueToChangesWhenValueHasChanged(
    changedFields.rangeCardinality, overriddenFields.rangeCardinality, initialOverriddenFields.rangeCardinality,
    range.cardinality, initialDomainAndRange.range?.cardinality,
    rangeChanges, "cardinality");
  rangeChanges = changedFields.usageNote ? { ...rangeChanges, usageNote: usageNote } : rangeChanges;

  // Copy only the changes (use what raw entity provided).
  const domainEnd = {
    ...initialDomainAndRange!.domain,
    ...domainChanges,
  } as SemanticModelRelationshipEndUsage;

  const rangeEnd = {
    ...initialDomainAndRange!.range,
    ...rangeChanges,
  } as SemanticModelRelationshipEndUsage;

  // Keep the same order of domain and range.
  let ends: SemanticModelRelationshipEndUsage[];
  if (initialDomainAndRange?.domainIndex == 1 && initialDomainAndRange?.rangeIndex == 0) {
    ends = [rangeEnd, domainEnd];
  } else {
    ends = [domainEnd, rangeEnd];
  }

  return [modifyRelationshipUsage(entity.id, { ends })];
};
