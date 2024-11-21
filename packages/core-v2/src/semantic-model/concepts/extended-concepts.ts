// This file contains extended version of concepts that have additional properties necessary for Dataspecer structure editor.

import { SemanticModelClass, SemanticModelRelationship, SemanticModelRelationshipEnd } from "./concepts";

export interface EntityWithTechnicalLabel {
  technicalLabel: string | null;
}

export interface ExtendedSemanticModelClass extends SemanticModelClass, EntityWithTechnicalLabel {
  isCodelist: boolean;

  codelistUrl: string[];

  regex: string | null;

  example: string[] | null;

  objectExample: object[] | null;
}

export interface ExtendedSemanticModelRelationship extends SemanticModelRelationship, EntityWithTechnicalLabel {
  ends: ExtendedSemanticModelRelationshipEnd[];
}

export interface ExtendedSemanticModelRelationshipEnd extends SemanticModelRelationshipEnd, EntityWithTechnicalLabel {
  languageStringRequiredLanguages: string[];

  regex: string | null;

  example: string[] | null;
}