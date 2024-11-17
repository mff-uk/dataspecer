import { useMemo } from "react";

import { type EntityModel } from "@dataspecer/core-v2";
import { type LanguageString } from "@dataspecer/core-v2/semantic-model/concepts";
import { VisualModel } from "@dataspecer/core-v2/visual-model";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";

import { type DialogProps } from "../dialog-api";
import { generateName } from "../../util/name-utils";
import { getModelIri } from "../../util/iri-utils";
import { configuration } from "../../application";
import { ModelGraphContextType } from "../../context/model-context";
import { EntityRepresentative, EntityModelRepresentative, representClasses, representModels, selectWritableModels } from "../dialog-utilities";
import { ClassesContextType } from "../../context/classes-context";
import { removeFromArray } from "../../utilities/functional";
import { sanitizeDuplicitiesInEntityLabels } from "../../utilities/label";
import { getRandomName } from "../../util/random-gen";
import { Specialization } from "./components/specialization-select";

export interface CreateClassDialogState {

  /**
   * Default language of the data.
   */
  language: string;

  /**
   * Available models.
   */
  availableModels: EntityModelRepresentative<EntityModel>[];

  /**
   * Available writable models.
   */
  writableModels: EntityModelRepresentative<InMemorySemanticModel>[];

  /**
   * Identifier of a model which is the entity owner.
   */
  model: EntityModelRepresentative<InMemorySemanticModel>;

  /**
   * Class IRI.
   */
  iri: string;

  /**
   * Derived from current model.
   */
  baseIri: string;

  /**
   * IRI was changed as a result of user action.
   */
  iriHasChanged: boolean;

  /**
   * True when IRI is absolute, otherwise it is relative.
   */
  absoluteIri: boolean;

  /**
   * Name of the new class.
   */
  name: LanguageString;

  /**
   * Description of the new class.
   */
  description: LanguageString;

  /**
   * List of all classes.
   * We use this to let user select parent for a new specializations.
   */
  availableClasses: EntityRepresentative[];

  /**
   * List of specializations.
   */
  specializations: Specialization[];

}

export function createCreateClassDialogState(
  classesContext: ClassesContextType,
  graphContext: ModelGraphContextType,
  visualModel: VisualModel | null,
  language: string,
  model: InMemorySemanticModel,
): CreateClassDialogState {
  const models = [...graphContext.models.values()];
  const availableModels = representModels(visualModel, models);
  const writableModels = representModels(visualModel, selectWritableModels(models));

  const name = generateName();
  const availableClasses = representClasses(
    graphContext.aggregatorView.getEntities(), models, classesContext.classes);
  const sanitizedAvailableClasses = sanitizeDuplicitiesInEntityLabels(
    availableModels, availableClasses);

  return {
    language,
    availableModels,
    writableModels,
    model: representModels(visualModel, [model])[0],
    iri: configuration().nameToClassIri(name),
    baseIri: getModelIri(model),
    iriHasChanged: false,
    absoluteIri: false,
    name: { [language]: name },
    description: {},
    availableClasses: sanitizedAvailableClasses,
    specializations: [],
  };
}

export interface CreateClassDialogController {

  setModel: (model: EntityModelRepresentative<InMemorySemanticModel>) => void;

  setIri: (iri: string) => void;

  onIriChanged: () => void;

  setName: (setter: (value: LanguageString) => LanguageString) => void;

  setDescription: (setter: (value: LanguageString) => LanguageString) => void;

  addSpecialization: (specialized: string) => void;

  removeSpecialization: (value: Specialization) => void;

}

export function useCreateClassDialogController({ changeState }: DialogProps<CreateClassDialogState>): CreateClassDialogController {

  return useMemo(() => {

    const setModel = (model: EntityModelRepresentative<InMemorySemanticModel>) => {
      changeState((state) => {
        return {
          ...state,
          model: model,
          baseIri: getModelIri(model.model),
        };
      });
    };

    const setIri = (iri: string) => {
      changeState((state) => ({ ...state, iri }));
    };

    const onIriChanged = () => {
      changeState((state) => ({ ...state, iriHasChanged: false }));
    };

    const setName = (setter: (value: LanguageString) => LanguageString): void => {
      changeState((state) => ({ ...state, name: setter(state.name) }));
    };

    const setDescription = (setter: (value: LanguageString) => LanguageString): void => {
      changeState((state) => ({ ...state, description: setter(state.description) }));
    };

    const addSpecialization = (specialized: string): void => {
      changeState((state) => ({
        ...state, specializations: [...state.specializations, {
          specialized,
          iri: getRandomName(10),
        }]
      }));
    };

    const removeSpecialization = (value: Specialization): void => {
      changeState((state) => ({
        ...state,
        specializations: removeFromArray(state.specializations, value),
      }));
    };

    return {
      setModel,
      setIri,
      onIriChanged,
      setName,
      setDescription,
      addSpecialization,
      removeSpecialization,
    };
  }, [changeState]);
}
