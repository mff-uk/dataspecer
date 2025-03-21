import { Language } from "../../configuration";

export interface AttributeData {

  identifier: string;

  name: string;

  profileOf: string | null;

};

export interface EditNodeAttributesState {

  language: Language;

  classIdentifier: string;

  isDomainNodeProfile: boolean;

  visibleAttributes: AttributeData[];

  hiddenAttributes: AttributeData[];

}

export function createEditNodeAttributesState(
  visibleAttributes: AttributeData[],
  hiddenAttributes: AttributeData[],
  classIdentifier: string,
  isDomainNodeProfile: boolean,
  language: Language,
): EditNodeAttributesState {
  return {
    visibleAttributes,
    hiddenAttributes,
    classIdentifier,
    isDomainNodeProfile,
    language,
  };
}
