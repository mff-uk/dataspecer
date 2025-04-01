
function prefix<T>(prefix: string, items: Record<string, T>): Record<string, T> {
  const result: Record<string, T> = {};
  for (const [key, value] of Object.entries(items)) {
    result[prefix + key] = value;
  }
  return result;
}

const dialogAssociation = prefix(
  "dialog.association.", {
    "cancel": "❌ Cancel",
    // Edit
    "label-edit": "Edit a relationship",
    "ok-edit": "✅ Save changes",
    // Create
    "label-create": "Create a new relationship",
    "ok-create": "✅ Create",
  });

const dialogAssociationProfile = prefix(
  "dialog.association-profile.", {
    "cancel": "❌ Cancel",
    // Edit
    "label-edit": "Edit a relationship profile",
    "ok-edit": "✅ Save changes",
    // Create
    "label-create": "Create a new relationship profile",
    "ok-create": "✅ Create",
  });

const dialogAttribute = prefix(
  "dialog.attribute.", {
    "cancel": "❌ Cancel",
    // Edit
    "label-edit": "Edit an attribute",
    "ok-edit": "✅ Save changes",
    // Create
    "label-create": "Create a new attribute",
    "ok-create": "✅ Create",
  });

const dialogAttributeProfile = prefix(
  "dialog.attribute-profile.", {
    "cancel": "❌ Cancel",
    // Edit
    "label-edit": "Edit an attribute profile",
    "ok-edit": "✅ Save changes",
    // Create
    "label-create": "Create a new attribute profile",
    "ok-create": "✅ Create",
  });

const dialogClass = prefix(
  "dialog.class.", {
    "cancel": "❌ Cancel",
    // Edit
    "label-edit": "Edit a class",
    "ok-edit": "✅ Save changes",
    // Create
    "label-create": "Create a new class",
    "ok-create": "✅ Create",
  });

const dialogClassProfile = prefix(
  "dialog.class-profile.", {
    "cancel": "❌ Cancel",
    // Edit
    "label-edit": "Edit a class profile",
    "ok-edit": "✅ Save changes",
    // Create
    "label-create": "Create a class profile",
    "ok-create": "✅ Create",
  });

  const dialogVisualDiagramNode = prefix(
  "dialog.visual-diagram-node.", {
    "cancel": "❌ Cancel",
    // Edit
    "label-edit": "Edit a visual diagram node",
    "label-info": "Show info about visual diagram node",
    "ok-edit": "✅ Save changes",
    // Create
    "label-create": "Create a new visual diagram node",
    "ok-create": "✅ Create",
  });

const dataspecer = prefix(
  "dataspecer", {
    "package.state-is-null": "There is no dataspecer state information, please reload the application",
    "package.missing-model": "Missing model.",
    "package.can-not-save-in-detached-mode": "Can not save in detached mode.",
    "ui-model.state-is-null": "There is no ui-model state information, please reload the application.",
  },
);

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export const translations: Record<string, string | Function> = {
  ...dialogAssociation,
  ...dialogAssociationProfile,
  ...dialogAttribute,
  ...dialogAttributeProfile,
  ...dialogClass,
  ...dialogClassProfile,
  ...dialogVisualDiagramNode,
  ...dataspecer,
  //
  "notification.icon-error": "Error icon",
  "notification.icon-success": "Check icon",
  //
  "header.package.label": (name: string) => `Package: ${name}`,
  "header.package.missing": "Package of unknown name",
  "header.package.save": "💾 Save",
  "header.package.save.title": "Save package",
  "header.package.disable": "To be able to save to backend, make sure you are in a package. Start with visiting the manager.",
  "header.package.save-and-leave": "💾👋 Save and leave",
  "header.package.save-and-leave.title": "Save package and go back to manager",
  //
  "header.logo-title": "Leave to manager without saving",
  //
  "create-class-dialog.name": "Name",
  "create-class-dialog.iri": "IRI",
  "create-class-dialog.description": "Definition",
  "create-class-dialog.error-iri-not-set": "iri not set",
  "create-class-dialog.btn-ok": "✅ create",
  "create-class-dialog.btn-cancel": "❌ cancel",
  "create-class-dialog.add-specialization": "Add specialization",
  "create-class-dialog.no-specialization-available": "There is nothing to specialize",
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
  "modify-entity-dialog.specialization-of": "Specializations of",
  "modify-entity-dialog.specialization-of-property": "Subproperty of",
  "modify-entity-dialog.description": "Definition",
  "modify-entity-dialog.usage-note": "Usage note",
  "modify-entity-dialog.attributes": "Attributes",
  "modify-entity-dialog.attributes-profiles": "Attribute profiles",
  "modify-entity-dialog.relationships": "Relationships",
  "modify-entity-dialog.relationships-profiles": "Relationships profiles",
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
  "create-profile-dialog.btn-ok": "Create profile",
  "create-profile-dialog.btn-close": "Cancel",
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
  "create-visual-diagram-node-dialog.label": "Node name",
  "create-visual-diagram-node-dialog.model-name": "Name of the referenced visual model",
  "create-visual-diagram-node-dialog.description": "Description",
  //
  "model.vocabularies": "Vocabularies",
  "model.classes": "Classes",
  "model.relationship": "Relationship",
  "model.attributes": "Attributes",
  "model.profiles": "Profiles",
  "model.warnings": "⚠️&nbsp;Warnings",
  "model-catalog.add-vocabulary": "➕",
  //
  "detail-dialog.btn-close": "Close",
  "detail-dialog.title.attribute": "Attribute detail",
  "detail-dialog.title.relationship": "Relationship detail",
  "detail-dialog.title.attribute-profile": "Attribute profile detail",
  "detail-dialog.title.class-profile": "Class profile detail",
  "detail-dialog.title.relationship-profile": "Relationship profile detail",
  "detail-dialog.title.unknown": "Entity detail",
  "detail-dialog.title.class": "Class detail",
  //
  "modify-dialog.btn-ok": "✅ Modify",
  "modify-dialog.btn-close": "❌ Close",
  "modify-dialog.title.attribute": "Edit attribute",
  "modify-dialog.title.relationship": "Edit relationship",
  "modify-dialog.title.attribute-profile": "Edit attribute profile",
  "modify-dialog.title.class": "Edit class",
  "modify-dialog.title.class-profile": "Edit class profile",
  "modify-dialog.title.relationship-profile": "Edit relationship profile",
  "modify-dialog.title.unknown": "Edit entity",
  //
  "create-connection-dialog.label": "Create connection",
  "create-connection-dialog.btn-ok": "✅ Create",
  "create-connection-dialog.btn-close": "❌ Discard",
  //
  "create-class-profile-dialog.label": "Create a profile",
  "modify-class-profile-dialog.profile-of": "Profile of",
  //
  "undefined": "Undefined",
  "change-in-profile": "Change in profile",
  //
  "warning": "Warning",
  "error": "Error",
  "warning-change-domain": "Change of the domain may introduce a breaking change in the profile.",
  "warning-change-domain-cardinality": "Change of cardinality may introduce a breaking change in the profile.",
  "warning-change-range": "Change of the range may introduce a breaking change in the profile.",
  "warning-change-range-cardinality": "Change of cardinality may introduce a breaking change in the profile.",
  //
  //
  "class-detail-button": "Class detail",
  "class-edit-button": "Edit class",
  "class-hide-button": "Remove class from canvas",
  "class-profile-button": "Create class profile",
  "class-remove-button": "Remove class from semantic model",
  "edit-node-attributes-visiblity-button": "Edit visibility of attributes on node",
  "duplicate-node-button": "Create new copy of the node on canvas",
  //
  "add-neighborhood-button.title": "Add entity's neighborhood (Classes or class profiles connected by either association or generalization)",
  //
  "node-anchor-button": "(Un)anchor node for layouting using force-directed layouting algorithm",
  "node-connection-handle": "Drag from this button to create connection (Dragging to canvas shows menu)",
  "node-add-attribute": "Add a new attribute",
  "node-add-attribute-profile": "Add an attribute profile",
  //
  "selection-action-button": "Show menu with actions on top of selection",
  "selection-layout-button": "Show menu with layout actions on top of selection",
  "selection-extend-button": "Show dialog to extend selection",
  "selection-filter-button": "Show dialog to filter selection",
  "selection-group-button": "Create group from selection",
  "group-anchor-button": "Toggle anchors of group to opposite value",
  //
  "selection-new-view-button": "Creates new visual model, which will contain selected nodes and edges",
  "selection-profile-button": "Creates profiles from selected nodes and edges",
  "selection-hide-button": "Removes selected nodes and edges from canvas",
  "selection-remove-button": "Delete selected nodes and edges from semantic model",
  "dissolve-group-button": "Dissolve group",
  //
  "iri-must-not-be-empty": "IRI must not be an empty string.",
  "domain-must-be-set": "Domain must be set.",
  "range-must-be-set": "Range must be set.",
  //
  "filter-selection-dialog.label": "Restrict selection to",
  "filter-selection-dialog.btn-ok": "✅ Restrict",
  "filter-selection-dialog.btn-cancel": "❌ Cancel",
  "filter-selection-class-filter-text": "Classes",
  "filter-selection-class-profile-filter-text": "Class profiles",
  "filter-selection-association-filter-text": "Relationships",
  "filter-selection-association-profile-filter-text": "Relationship profiles ",
  "filter-selection-generalization-filter-text": "Generalizations",
  //
  "extend-selection-dialog.label": "Extend selection by",
  "extend-selection-dialog.btn-ok": "✅ Accept",
  "extend-selection-dialog.btn-cancel": "❌ Cancel",
  "extend-selection-association-name": "Association",
  "extend-selection-generalization-name": "Generalization",
  "extend-selection-association-profile-name": "Association profile",
  "extend-selection-class-profile-name": "Class profile",
  "extend-by-incoming-header": "Incoming",
  "extend-by-outgoing-header": "Outgoing",
  //
  "show-all-classes-from-semantic-model-to-visual-model-button.title": "Add all entities from semantic model to visual model",
  "remove-all-classes-contained-semantic-model-from-visual-model-button.title": "Remove all entities from semantic model from the visual model",
  //
  "exploration-mode-button.title": "Toggle highlighting exploration mode",
  "exploration-mode-button.name": "Exploration",
  //
  "drag-edge-to-canvas-create-association-target": "Create new association target",
  "drag-edge-to-canvas-create-association-source": "Create new association source",
  "drag-edge-to-canvas-create-generalization-parent": "Create new parent",
  "drag-edge-to-canvas-create-generalization-child": "Create new child",
  //
  "edit-visual-node-dialog.label": "Edit visual node",
  "edit-visual-node-dialog.btn-ok": "✅ Accept",
  "edit-visual-node-dialog.btn-cancel": "❌ Cancel",
  "edit-visual-node-dialog.content-visible": "Visible content:",
  "edit-visual-node-dialog.content-available": "Available content:",
  //
  "visual-diagram-node-dissolve-button": "Dissolves node representing visual model. That is the content of the diagram node is put back on canvas.",
  "visual-diagram-node-hide-button": "Removes the diagram node from canvas.",
  "visual-diagram-node-add-relationships-button": "Adds all the relationships related to the content of the visual diagram node",
  "visual-diagram-node-move-to-source-visual-model-button": "Change visual model to the visual model represented by this diagram node",
  "visual-diagram-node-edit-button": "Edit diagram node's properties",
  "visual-diagram-node-detail-button": "Show info about visual model diagram node",
  "visual-diagram-node-create-from-selection-button": "Creates new visual model with selected entities and puts diagram node representing the newly created model to the original visual model",
  //
  "visual-diagram-node-info-dialog.representedVisualModelName": "Represented visual model",
  "visual-diagram-node-info-dialog.label": "Name",
  "visual-diagram-node-info-dialog.description": "Description",
};
