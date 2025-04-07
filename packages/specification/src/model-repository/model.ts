import { LanguageString } from "@dataspecer/core/core/core-resource";

export interface Model {
  id: string;
  readonly types: string[];

  getUserMetadata(): {
    label: LanguageString;
  };
}