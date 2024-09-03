import { EntityModel } from "@dataspecer/core-v2";
import { SemanticModelClassUsage, SemanticModelRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";

import { LanguageString, SemanticModelClass, SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { DialogProps } from "../dialog-api";
import { Languages } from "next/dist/lib/metadata/types/alternative-urls-types";

export interface DetailClassState {

  model: EntityModel;

  entity: SemanticModelClass;

  addToViewDisabled: boolean;

  /**
   * Current language.
   */
  language: string;

  iri: string;

  name: string;

  description: string;

  relationships: SemanticModelRelationship[];

  profiledBy: SemanticModelClassUsage[];

  specializationOf: SemanticModelClass[];

  generalizationOf: SemanticModelClass[];

}

type ResourceType = SemanticModelClass
  | SemanticModelRelationship
  | SemanticModelClassUsage
  | SemanticModelRelationshipUsage;

export interface DetailClassControllerType {

  addToView: () => void;
  // handleAddEntityToActiveView(viewedEntity.id);
  // setAddToActiveViewButtonClicked(true);
  // localClose();

  setLanguage: (language: string) => void;

  openResouceDetail: (resource: ResourceType) => void;

}

export function useDetailClassController({ state, changeState }: DialogProps<DetailClassState>): DetailClassControllerType {

};
