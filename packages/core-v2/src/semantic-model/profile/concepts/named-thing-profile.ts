import { LanguageString } from "../../concepts";

/**
 * For each property we can have a value, or inherit it from a given profiled entity.
 */
export interface NamedThingProfile {

  name: LanguageString | null;

  /**
   * If set, the value of respective property must be load from the profile.
   */
  nameFromProfiled: string | null;

  description: LanguageString | null;

  /**
   * If set, the value of respective property must be load from the profile.
   */
  descriptionFromProfiled: string | null;

}
