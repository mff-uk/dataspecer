import {logger} from "./logging";

/**
 * List of texts used in the application.
 */
// eslint-disable-next-line @typescript-eslint/ban-types
const translations: Record<string, string | Function> = {
  "notification.icon-error": "Error icon",
  "notification.icon-sucess": "Check icon",
  //
  "header.package.label": (name:string) => `Package: ${name}`,
  "header.package.missing": "Package of unknown name",
  "header.package.save": "💾 Save",
  "header.package.save.title": "Save package",
  "header.package.disable": "To be able to save to backend, make sure you are in a package.  Start with visiting tjhe manager.",
  "header.package.save-and-leave": "💾👋 Save and leave",
  "header.package.save-and-leave.title": "Save package and go back to manager",
  //
  "header.logo-title": "Leave to manager without saving",
  //
  "create-class-dialog.label": "Create a new class",
  "create-class-dialog.name": "Name",
  "create-class-dialog.iri": "IRI",
  "create-class-dialog.description": "Definition",
  "create-class-dialog.error-iri-not-set": "iri not set",
  "create-class-dialog.btn-ok": "✅ create",
  "create-class-dialog.btn-cancel": "❌ cancel",
  //
  "create-profile-button.title": "Create profile",
  //
  "modify-entity-dialog.label-class": "Class modification",
  "modify-entity-dialog.label-class-profile": "Class profile modification",
  "modify-entity-dialog.label-relationship": "Relationship modification",
  "modify-entity-dialog.label-attribute": "Attribute modification",
  "modify-entity-dialog.label-relationship-profile": "Relationship profile modification",
  "modify-entity-dialog.label-attribute-profile": "Attribute profile modification",
  "modify-entity-dialog.type": "Name",
  "modify-entity-dialog.id": "Identifier",
  "modify-entity-dialog.iri": "IRI",
  "modify-entity-dialog.specialization-of": "Specialization of",
  "modify-entity-dialog.specialization-of-property": "Subproperty of",
  "modify-entity-dialog.description": "Definition",
  "modify-entity-dialog.usage-note": "Usage note",
  "modify-entity-dialog.attributes": "Attributes",
  "modify-entity-dialog.attributes-profiles": "Attribute profiles",
  //
  "attributes-component.name": "Name",
  "attributes-component.description": "Definition",
  "attributes-component.iri": "IRI",
  "attributes-component.cardinality": "Cardinality",
  "attributes-component.datatype": "Datatype",
  //
  "entity-detail-dialog.type": "Type",
  "entity-detail-dialog.description": "Definition",
  "entity-detail-dialog.original-profile": "The original profiled entity",
  "entity-detail-dialog.profiled-by": "Profiled by",
  "entity-detail-dialog.specialization-of": "Specialization of",
  "entity-detail-dialog.specialization-of-property": "Subproperty of",
  "entity-detail-dialog.generalization-of": "Generalization of",
  "entity-detail-dialog.attributes": "Attributes",
  "entity-detail-dialog.attributes-profiles": "Attribute profiles",
  "entity-detail-dialog.usage-note": "Usage note",
  "entity-detail-dialog.domain": "Domain",
  "entity-detail-dialog.range": "Range",
  "entity-detail-dialog.datatype": "Datatype",
  "entity-detail-dialog.direct-profile": "Direct profile of",
  //
  "create-connection-dialog.iri": "IRI",
  "create-connection-dialog.type": "Type",
  "create-connection-dialog.name": "Name",
  "create-connection-dialog.description": "Definition",
  "create-connection-dialog.cardinality": "Cardinalities",
  "create-connection-dialog.source": "Source",
  "create-connection-dialog.target": "Target",
  //
  "model-service.model-label-from-id": (id: string) => `Unnamed model with id '${id}'`,
  //
  "create-profile-dialog.label": (profile: string) => `Create a profile ${profile ? "of '" + profile + "'" : ""}`,
  "create-profile-dialog.profiled": "Profiled entity",
  "create-profile-dialog.profiled-type": "Profiled entity type",
  "create-profile-dialog.name": "Name",
  "create-profile-dialog.iri": "IRI",
  "create-profile-dialog.description": "Definition",
  "create-profile-dialog.usage-note": "Usage note",
  "create-profile-dialog.warning": "Warning",
  //
  "model": "Model",
  "generalization-label": (child: string, parent: string) => `Generalization of '${child}' is '${parent}'`,
  "domain": "Domain",
  "domain-cardinality": "Domain cardinality",
  "range": "Range",
  "range-cardinality": "Range cardinality",
  //
  "add-model-dialog.label": "Add vocabulary",
  "add-model-dialog.tab-from-url": "Vocabulary from URL",
  "add-model-dialog.tab-predefined": "Well-known vocabularies",
  "add-model-dialog.tab-create": "Create new vocabulary",
  "add-model-dialog.btn-ok": "✅ Add vocabulary(s)",
  "add-model-dialog.btn-cancel": "❌ Cancel",
  "add-model-dialog.url-label": "Vocabulary Turtle file (*.ttl) URL:",
  "add-model-dialog.url-placeholder": "URL:",
  "add-model-dialog.alias-label": "Alias:",
  "add-model-dialog.alias-placeholder": "Alias for your vocabulary, you can change this later.",
  "add-model-dialog.url-size-warning": "Be warned, that the import is not optimized for large files.",
  "add-model-dialog.tab-predefined.introduction": "Select vocabulary from bellow to import. You can import multiple at once.",
  "add-model-dialog.tab-create.introduction": "Create an empty vocabulary.",
  //
  "model.vocabularies": "Vocabularies",
  "model.classes": "Classes",
  "model.associations": "Associations",
  "model.attributes": "Attributes",
  "model.profiles": "Profiles",
  "model.warnings": "⚠️&nbsp;Warnings",
  "model-catalog.add-vocabulary": "➕ Vocabulary",
  //
  "detail-dialog.btn-close": "Close",
  "detail-dialog.title.attribute": "Attribute detail",
  "detail-dialog.title.relationship": "Relationship detail",
  "detail-dialog.title.attribute-profile": "Attribute profile detail",
  "detail-dialog.title.class-profile": "Class profile detail",
  "detail-dialog.title.relationship-profile": "Relationship profile detail",
  "detail-dialog.title.unknown": "Entity detail",
};

export const t = (text: string, ...args: unknown[]) : string => {
  const result = translations[text];
  if (result === undefined) {
    logger.missingTranslation(text);
    return "MISSING: " + text;
  } else  if (result instanceof Function) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return result(...args);
  } else {
    return result;
  }
};
