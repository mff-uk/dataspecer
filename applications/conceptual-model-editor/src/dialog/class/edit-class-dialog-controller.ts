import type React from "react";
import { useMemo } from "react";

import { type EntityModel } from "@dataspecer/core-v2";
import { type LanguageString } from "@dataspecer/core-v2/semantic-model/concepts";

import { type DialogProps } from "../dialog-api";
import { generateName } from "../../util/name-utils";
import { getModelIri } from "../../util/iri-utils";

import { configuration } from "../../application";

export interface EditClassState {

  /**
   * Owner.
   */
  model: EntityModel;

  /**
   * Class IRI.
   */
  iri: string;

  /**
   * Derived from current model.
   */
  baseIri: string;

  /**
   * When true, we will autogenerate IRI from name on name change.
   */
  autoGenerateIri: boolean;

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
   * Default language.
   */
  language: string;

}

/**
 * @returns State for a new class.
 */
export function createEditClassNewState(
  model: EntityModel,
  language: string,
): EditClassState {
  const name = generateName();
  return {
    model,
    iri: configuration().nameToClassIri(name),
    baseIri: getModelIri(model),
    autoGenerateIri: true,
    absoluteIri: false,
    name: { [language]: name },
    description: {},
    language: language,
  };
}

export interface CreateEditControllerType {

  setModel: (identifier: string, model: EntityModel) => void;

  setIri: (iri: string) => void;

  onUserChangedIri: () => void;

  setName: React.Dispatch<React.SetStateAction<LanguageString>>;

  setDescription: React.Dispatch<React.SetStateAction<LanguageString>>;

}

export function useEditClassController({ state, changeState }: DialogProps<EditClassState>): CreateEditControllerType {

  return useMemo(() => {

    const setModel = (_: string, model: EntityModel) => {
      changeState({
        ...state,
        model: model,
        baseIri: getModelIri(model),
      });
    };

    const setIri = (iri: string) => {
      changeState((state) => ({ ...state, iri }));
    };

    const onUserChangedIri = () => {
      changeState((state) => ({ ...state, autoGenerateIri: false }));
    };

    const setName = (value: LanguageString | ((prev: LanguageString) => LanguageString)): void => {
      const name: LanguageString = typeof value === "function" ?
        value(state.name) : value;
      changeState({ ...state, name });
    };

    const setDescription = (value: LanguageString | ((prev: LanguageString) => LanguageString)): void => {
      const description: LanguageString = typeof value === "function" ?
        value(state.name) : value;
      changeState({ ...state, description });
    };

    return {
      setModel,
      setIri,
      onUserChangedIri,
      setName,
      setDescription,
    };
  }, [state, changeState]);
}
