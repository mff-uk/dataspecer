import { LanguageString } from "../../concepts";

/**
 * The idea of profile is to put certain entity, or a profile, into given context.
 * A single profile entity can profile multiple other entities.
 */
export interface Profile {

  /**
   * ID of all profiled entities.
   */
  profiling: string[];

  /**
   * Optional information about the profile of the entity.
   * If there is change in the meaning in the new context, is should be explained here.
   */
  usageNote: LanguageString | null;

  /**
   * If set, the value of respective property must be load from the profile.
   */
  usageNoteFromProfiled: string | null;

}
